import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  PerspectiveCamera,
  Points,
  ShaderMaterial,
} from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";

type JourneyRef = { current: SceneJourney };

export const SENTINEL_POSITION: [number, number, number] = [1.95, 2.32, 0.42];

const glassVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 displaced = position + normal * sin(position.y * 5.5 + uTime * 0.45) * 0.012;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vec4 view = viewMatrix * world;
    vView = view.xyz;
    vNormal = normalize(mat3(modelViewMatrix) * normal);
    gl_Position = projectionMatrix * view;
  }
`;

const glassFragment = /* glsl */ `
  precision highp float;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(-vView))), 2.2);
    vec3 tint = mix(vec3(0.09, 0.07, 0.29), vec3(0.49, 0.22, 0.93), fresnel);
    float alpha = (0.02 + fresnel * 0.12) * (0.4 + uIntensity * 0.6);
    gl_FragColor = vec4(tint, alpha);
  }
`;

const scanVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const scanFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float visor = smoothstep(1.02, 0.72, length(p * vec2(0.92, 1.15)));
    float cycle = fract(uTime / 13.5);
    float sweep = cycle < 0.2 ? cycle / 0.2 : -2.0;
    float band = smoothstep(0.045, 0.0, abs(p.y - (sweep * 1.7 - 0.85)));
    float alpha = band * visor * 0.55 * uIntensity;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(vec3(0.77, 0.71, 0.99), alpha);
  }
`;

export function SecuritySentinel({
  motion,
  journey,
  reducedMotion,
  detailed,
}: {
  motion: MotionRef;
  journey: JourneyRef;
  reducedMotion: boolean;
  detailed: boolean;
}) {
  const root = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const glass = useRef<ShaderMaterial>(null);
  const scan = useRef<ShaderMaterial>(null);
  const mote = useRef<Points>(null);
  const moteCount = detailed ? 42 : 16;
  const motes = useMemo(() => {
    const data = new Float32Array(moteCount * 3);
    for (let index = 0; index < moteCount; index += 1) {
      const angle = index * 2.399;
      const radius = 0.35 + (index % 6) * 0.22;
      data[index * 3] = Math.cos(angle) * radius * 0.75;
      data[index * 3 + 1] = Math.sin(angle * 0.7) * radius;
      data[index * 3 + 2] = -1.4 + (index % 8) * 0.38;
    }
    return data;
  }, [moteCount]);
  const glassUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uIntensity: { value: 0.2 } }),
    [],
  );
  const scanUniforms = useMemo(
    () => ({ uTime: { value: reducedMotion ? 2.4 : 0 }, uIntensity: { value: 0.2 } }),
    [reducedMotion],
  );

  useFrame(({ clock, camera }) => {
    const group = root.current;
    if (!group) return;
    const intensity = motion.current?.intensity ?? 0.2;
    const time = reducedMotion ? 0 : clock.elapsedTime;
    const depth = journey.current.depth;
    const pinned = 1 - Math.min(1, depth * 3.5);
    const view = camera instanceof PerspectiveCamera ? camera : null;
    const distance = Math.max(0.8, camera.position.z - SENTINEL_POSITION[2]);
    const halfHeight = view ? Math.tan((view.fov * Math.PI) / 360) * distance : 2.4;
    const halfWidth = halfHeight * Math.max(0.4, view?.aspect ?? 1.6);
    const aspect = view?.aspect ?? 1.6;
    const screenX = (aspect < 1 ? 0.38 : 0.62) * halfWidth;
    const pointerX = reducedMotion ? 0 : journey.current.pointerX;
    const pointerY = reducedMotion ? 0 : journey.current.pointerY;
    group.position.set(
      SENTINEL_POSITION[0] + (screenX - SENTINEL_POSITION[0]) * pinned + pointerX * 0.08,
      SENTINEL_POSITION[1] + (aspect < 1 ? halfHeight * 0.58 : 0) * pinned - pointerY * 0.05,
      SENTINEL_POSITION[2],
    );
    const fit = aspect < 1 ? 0.46 : 1;
    const presence = 0.84 + intensity * 0.18;
    group.scale.setScalar(presence * fit);
    group.rotation.y = (reducedMotion ? 0.18 : Math.sin(time * 0.12) * 0.08) + pointerX * 0.1;
    group.rotation.x = 0.06 - pointerY * 0.05;
    if (rings.current && !reducedMotion) {
      rings.current.rotation.z = time * 0.05;
      rings.current.rotation.y = time * 0.08;
    }
    glassUniforms.uTime.value = time;
    glassUniforms.uIntensity.value = intensity;
    if (!reducedMotion) scanUniforms.uTime.value = time;
    scanUniforms.uIntensity.value = intensity;
    const material = mote.current?.material;
    if (material && !Array.isArray(material)) material.opacity = 0.15 + intensity * 0.55;
    if (reducedMotion || !mote.current) return;
    const attribute = mote.current.geometry.getAttribute("position");
    if (!(attribute instanceof Float32BufferAttribute)) return;
    for (let index = 0; index < moteCount; index += 1) {
      let z = attribute.getZ(index) + 0.08 * (0.35 + (index % 5) * 0.08);
      if (z > 1.6) z = -1.6;
      attribute.setZ(index, z);
    }
    attribute.needsUpdate = true;
  });

  return (
    <group ref={root} position={SENTINEL_POSITION}>
      <mesh scale={[1.18, 1.28, 0.36]}>
        <sphereGeometry args={[1, detailed ? 64 : 28, detailed ? 40 : 18]} />
        <meshPhysicalMaterial
          color="#0B1240"
          emissive="#241047"
          emissiveIntensity={0.55}
          metalness={0.94}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <mesh scale={[1.28, 1.38, 0.48]}>
        <sphereGeometry args={[1, detailed ? 40 : 20, detailed ? 28 : 14]} />
        <shaderMaterial
          ref={glass}
          uniforms={glassUniforms}
          vertexShader={glassVertex}
          fragmentShader={glassFragment}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.02, 0.34]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.05, 12]} />
        <meshStandardMaterial
          color="#05030A"
          emissive="#F02CB7"
          emissiveIntensity={0.55}
          metalness={0.2}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#241047"
          emissive="#A855F7"
          emissiveIntensity={1.45}
          metalness={0.25}
          roughness={0.12}
          toneMapped={false}
        />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[1.2, 0.15, 0.2]}>
          <torusGeometry args={[1.12, 0.006, 8, detailed ? 96 : 48]} />
          <meshBasicMaterial color="#40BFFF" transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh rotation={[0.85, 0.7, 0.35]}>
          <torusGeometry args={[1.28, 0.004, 8, detailed ? 80 : 40]} />
          <meshBasicMaterial color="#A855F7" transparent opacity={0.26} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0.02, 0.52]}>
        <planeGeometry args={[1.7, 2.35]} />
        <shaderMaterial
          ref={scan}
          uniforms={scanUniforms}
          vertexShader={scanVertex}
          fragmentShader={scanFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
      <points ref={mote}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motes, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#40BFFF"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

export function NetworkTopology({
  detailed,
  reducedMotion,
  journey,
}: {
  detailed: boolean;
  reducedMotion: boolean;
  journey: JourneyRef;
}) {
  const flow = useRef<Group>(null);
  const pulses = useRef<Points>(null);
  const count = detailed ? 16 : 8;
  const nodes = useMemo(() => {
    const points: Array<[number, number, number]> = [];
    for (let index = 0; index < count; index += 1) {
      const angle = -0.7 + index * 0.52;
      points.push([
        1.25 + Math.cos(angle) * (0.7 + (index % 3) * 0.38),
        1.45 + Math.sin(angle) * 0.72,
        2.1 - index * (detailed ? 1.05 : 1.7),
      ]);
    }
    return points;
  }, [count, detailed]);

  const lines = useMemo(() => {
    const positions: number[] = [];
    nodes.forEach((point, index) => {
      const next = nodes[index + 1];
      if (next) positions.push(point[0], point[1], point[2], next[0], next[1], next[2]);
      const bridge = nodes[index + 3];
      if (index % 3 === 0 && bridge) {
        positions.push(point[0], point[1], point[2], bridge[0], bridge[1], bridge[2]);
      }
    });
    const anchor = SENTINEL_POSITION;
    const first = nodes[0];
    if (first) positions.push(anchor[0], anchor[1], anchor[2], first[0], first[1], first[2]);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [nodes]);

  const pulseSeeds = useMemo(
    () =>
      Array.from({ length: detailed ? 5 : 2 }, (_, index) => ({
        from: nodes[index % nodes.length] ?? SENTINEL_POSITION,
        to: nodes[(index + 1) % nodes.length] ?? SENTINEL_POSITION,
        offset: index * 0.17,
      })),
    [detailed, nodes],
  );
  const pulsePositions = useMemo(() => new Float32Array(pulseSeeds.length * 3), [pulseSeeds.length]);

  useFrame(({ clock, camera }) => {
    if (flow.current) {
      const aspect = camera instanceof PerspectiveCamera ? camera.aspect : 1.6;
      const narrow = aspect < 1;
      flow.current.position.set(narrow ? 0.25 : 0, narrow ? 2.35 : 0, 0);
      flow.current.scale.setScalar(narrow ? 0.4 : 1);
      if (!reducedMotion) {
        const sway = Math.sin(clock.elapsedTime * 0.07) * 0.03;
        flow.current.rotation.y = sway + journey.current.pointerX * 0.02;
      }
    }
    const cloud = pulses.current;
    if (!cloud || reducedMotion) return;
    const attribute = cloud.geometry.getAttribute("position");
    if (!(attribute instanceof Float32BufferAttribute)) return;
    pulseSeeds.forEach((seed, index) => {
      const t = (clock.elapsedTime * 0.07 + seed.offset) % 1;
      attribute.setXYZ(
        index,
        seed.from[0] + (seed.to[0] - seed.from[0]) * t,
        seed.from[1] + (seed.to[1] - seed.from[1]) * t,
        seed.from[2] + (seed.to[2] - seed.from[2]) * t,
      );
    });
    attribute.needsUpdate = true;
  });

  return (
    <group ref={flow}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#40BFFF" transparent opacity={0.22} />
      </lineSegments>
      {nodes.map((point, index) => (
        <mesh key={`${point[0]}-${point[2]}`} position={point}>
          <sphereGeometry args={[index % 4 === 0 ? 0.055 : 0.03, 12, 10]} />
          <meshStandardMaterial
            color="#0B1240"
            emissive={index % 4 === 0 ? "#F02CB7" : "#A855F7"}
            emissiveIntensity={0.45}
            metalness={0.62}
            roughness={0.24}
          />
        </mesh>
      ))}
      <points ref={pulses}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#F02CB7"
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
