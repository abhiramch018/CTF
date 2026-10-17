import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh, ShaderMaterial } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import type { PortalSpec } from "../lib/sceneLayout.ts";

type JourneyRef = { current: SceneJourney };

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float core = smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
    float rise = smoothstep(0.18, 0.0, abs(fract(vUv.y * 6.0 - uTime * 0.1) - 0.5));
    vec3 emerald = vec3(0.0, 0.722, 0.361);
    vec3 hot = vec3(0.65, 1.0, 0.82);
    vec3 color = mix(emerald, hot, core * 0.8 + rise * 0.28);
    float alpha = core * (0.16 + 0.62 * clamp(uIntensity, 0.0, 1.4));
    gl_FragColor = vec4(color, alpha);
  }
`;

type PortalProps = {
  motion: MotionRef;
  spec: PortalSpec;
  journey: JourneyRef;
  scrollLive: boolean;
};

export function Portal({ motion, spec, journey, scrollLive }: PortalProps) {
  const beam = useRef<ShaderMaterial>(null);
  const slit = useRef<Mesh>(null);
  const cube = useRef<Group>(null);
  const leftSeal = useRef<Mesh>(null);
  const rightSeal = useRef<Mesh>(null);
  const glyphs = useMemo(
    () =>
      [
        [0.16, 0.14, 0.34],
        [-0.16, 0.14, 0.34],
        [0, -0.12, 0.34],
        [0.28, 0, 0.04],
        [-0.28, -0.08, -0.02],
      ] as Array<[number, number, number]>,
    [],
  );

  useFrame(({ clock }, delta) => {
    const current = motion.current;
    const breach = scrollLive ? journey.current.breach : 0;
    const cubePower = current?.cube ?? 1;
    const beamPower = current?.beam ?? 1;
    if (beam.current) {
      beam.current.uniforms.uTime.value += delta;
      beam.current.uniforms.uIntensity.value = beamPower * (0.35 + breach * 0.9) + (current?.intensity ?? 0) * 0.25;
    }
    if (slit.current) {
      slit.current.scale.x = 0.35 + beamPower * 0.9 + breach * 2.4;
      slit.current.visible = beamPower > 0.04;
    }
    if (cube.current) {
      const spin = clock.elapsedTime * (0.18 + breach * 0.12);
      cube.current.rotation.y = spin;
      cube.current.rotation.x = Math.sin(clock.elapsedTime * 0.28) * 0.06;
      cube.current.position.y = 3.62 + Math.sin(clock.elapsedTime * 0.55) * 0.04 + breach * 0.22;
      const scale = 0.08 + cubePower * 0.92;
      cube.current.scale.setScalar(scale);
      cube.current.visible = cubePower > 0.03;
    }
    if (leftSeal.current) leftSeal.current.position.x = -0.16 - breach * 0.28;
    if (rightSeal.current) rightSeal.current.position.x = 0.16 + breach * 0.28;
  });

  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh position={[-0.72, 1.55, 0]}>
        <boxGeometry args={[0.28, 3.1, 0.28]} />
        <meshStandardMaterial color="#07100C" roughness={0.78} />
      </mesh>
      <mesh position={[0.72, 1.55, 0]}>
        <boxGeometry args={[0.28, 3.1, 0.28]} />
        <meshStandardMaterial color="#07100C" roughness={0.78} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[1.72, 0.22, 0.28]} />
        <meshStandardMaterial color="#07100C" emissive="#00B85C" emissiveIntensity={0.12} />
      </mesh>
      <mesh ref={slit} position={[0, 1.45, 0.02]}>
        <planeGeometry args={[0.22, 2.55]} />
        <shaderMaterial
          ref={beam}
          uniforms={{ uTime: { value: 0 }, uIntensity: { value: 0 } }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={cube} position={[0, 3.62, 0]}>
        <mesh>
          <boxGeometry args={[0.78, 0.78, 0.78]} />
          <meshStandardMaterial color="#07100C" emissive="#063A25" emissiveIntensity={0.45} roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh ref={leftSeal} position={[-0.2, 0, 0.3]}>
          <boxGeometry args={[0.06, 0.42, 0.04]} />
          <meshStandardMaterial color="#063A25" emissive="#00B85C" emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
        <mesh ref={rightSeal} position={[0.2, 0, 0.3]}>
          <boxGeometry args={[0.06, 0.42, 0.04]} />
          <meshStandardMaterial color="#063A25" emissive="#00B85C" emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
        {glyphs.map(([x, y, z]) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
            <boxGeometry args={[0.07, 0.07, 0.025]} />
            <meshStandardMaterial color="#063A25" emissive="#00F07A" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
