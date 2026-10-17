import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, Color, InstancedMesh, Matrix4, Points, ShaderMaterial } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { buildScene, sceneQuality, type SceneQuality } from "../lib/sceneLayout.ts";
import { Operative } from "./Operative.tsx";
import { Portal } from "./Portal.tsx";
import { DataBeams, PacketRoutes, VoxelFragments } from "./WorldLife.tsx";

type JourneyRef = { current: SceneJourney };

type VoxelSceneProps = {
  motion: MotionRef;
  journey: JourneyRef;
  active: boolean;
  reducedMotion: boolean;
  scrollLive: boolean;
  onReady: () => void;
};

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function CameraRig({
  motion,
  journey,
  reducedMotion,
  scrollLive,
}: {
  motion: MotionRef;
  journey: JourneyRef;
  reducedMotion: boolean;
  scrollLive: boolean;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ camera, clock, size }) => {
    const current = motion.current;
    if (!current) return;
    const drift = reducedMotion ? 0 : current.drift;
    const time = clock.elapsedTime;
    const live = scrollLive && !reducedMotion;
    pointer.current.x += ((live ? journey.current.pointerX : 0) - pointer.current.x) * 0.04;
    pointer.current.y += ((live ? journey.current.pointerY : 0) - pointer.current.y) * 0.04;
    if (!live) {
      camera.position.set(
        current.x + Math.sin(time * 0.1) * 0.06 * drift,
        current.y + Math.sin(time * 0.07) * 0.03 * drift,
        current.z,
      );
      camera.lookAt(current.lookX, current.lookY, current.lookZ);
      return;
    }
    const narrow = size.width < 800;
    const breach = journey.current.breach;
    const depth = journey.current.depth;
    const fromX = narrow ? -0.35 : -2.55;
    const fromZ = (narrow ? 14 : 12.5) - depth * 0.35;
    const toX = narrow ? 1.15 : 0.85;
    const toZ = narrow ? 5.6 : 3.55;
    camera.position.set(
      mix(fromX, toX, breach) + pointer.current.x * 0.05,
      mix(narrow ? 2.6 : 3.2, 1.7, breach) - pointer.current.y * 0.02,
      mix(fromZ, toZ, breach),
    );
    camera.lookAt(
      mix(narrow ? 1.5 : 0.85, 2.05, breach) + pointer.current.x * 0.03,
      mix(1.65, 1.75, breach),
      mix(0.2, -0.05, breach),
    );
  });
  return null;
}

function Lights({
  motion,
  journey,
  scrollLive,
}: {
  motion: MotionRef;
  journey: JourneyRef;
  scrollLive: boolean;
}) {
  const portalLight = useRef<import("three").PointLight>(null);
  useFrame(({ clock }) => {
    const lamp = portalLight.current;
    if (!lamp || !motion.current) return;
    const beam = motion.current.beam ?? 1;
    const breach = scrollLive ? journey.current.breach : 0;
    const pulse = scrollLive ? Math.sin(clock.elapsedTime * 0.7) * 0.12 : Math.sin(clock.elapsedTime * 0.45) * 0.06;
    lamp.intensity = (0.12 + beam * 0.7 + breach * 0.45) * (0.8 + motion.current.intensity * 0.3) + pulse;
  });
  return (
    <>
      <ambientLight color="#06100C" intensity={0.42} />
      <hemisphereLight color="#063A25" groundColor="#020504" intensity={0.55} />
      <directionalLight color="#A6FFD1" intensity={0.42} position={[-4, 8, 5]} />
      <pointLight ref={portalLight} color="#00F07A" position={[2.15, 2.15, 0.15]} distance={9} decay={2} />
      <pointLight color="#A6FFD1" position={[1.5, 1.6, 4.4]} distance={8} decay={2} intensity={0.55} />
      <pointLight color="#00B85C" position={[6.2, 3.4, -16]} distance={24} decay={2} intensity={0.7} />
    </>
  );
}

const groundVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const groundFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    float portal = exp(-pow(vWorld.x - 2.15, 2.0) * 0.18 - pow(vWorld.z - 0.2, 2.0) * 0.1);
    float sheen = portal * (0.22 + 0.04 * sin(uTime * 0.5 + vWorld.x));
    float seam = step(0.94, fract(vWorld.x * 0.5)) + step(0.94, fract(vWorld.z * 0.5));
    vec3 base = vec3(0.012, 0.028, 0.022);
    vec3 glow = vec3(0.0, 0.55, 0.28);
    vec3 color = mix(base, glow, sheen) + vec3(0.0, 0.12, 0.06) * seam * 0.25;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function WetPlaza() {
  const material = useRef<ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.15, 0.012, 0.6]}>
      <planeGeometry args={[14, 12]} />
      <shaderMaterial
        ref={material}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={groundVertex}
        fragmentShader={groundFragment}
      />
    </mesh>
  );
}

function VoxelField({
  matrices,
  tone,
}: {
  matrices: Matrix4[];
  tone: "stone" | "ground" | "accent";
}) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
    if (tone !== "accent") {
      const color = new Color();
      matrices.forEach((_, index) => {
        const band = index % 6;
        const lift = band * 0.012;
        color.setRGB(0.012 + lift * 0.15, tone === "ground" ? 0.045 + lift : 0.08 + lift, 0.03 + lift);
        mesh.setColorAt(index, color);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [matrices, tone]);

  if (matrices.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}>
      <boxGeometry args={[1, 1, 1]} />
      {tone === "accent" ? (
        <meshStandardMaterial color="#063A25" emissive="#00B85C" emissiveIntensity={0.45} roughness={0.4} metalness={0.15} />
      ) : (
        <meshStandardMaterial roughness={tone === "ground" ? 0.42 : 0.78} metalness={tone === "ground" ? 0.35 : 0.12} />
      )}
    </instancedMesh>
  );
}

function DriftParticles({
  count,
  motion,
  reducedMotion,
}: {
  count: number;
  motion: MotionRef;
  journey: JourneyRef;
  reducedMotion: boolean;
  scrollLive: boolean;
}) {
  const [positions] = useState(() => {
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 12;
      data[index * 3 + 1] = 0.3 + Math.random() * 4.5;
      data[index * 3 + 2] = 5 - Math.random() * 40;
    }
    return data;
  });
  const [speeds] = useState(() => Float32Array.from({ length: count }, () => 0.08 + Math.random() * 0.16));
  const ref = useRef<Points>(null);

  useFrame((_, delta) => {
    const activity = reducedMotion ? 0 : (motion.current?.particles ?? 0);
    const pointsMaterial = ref.current?.material;
    if (pointsMaterial && !Array.isArray(pointsMaterial)) pointsMaterial.opacity = 0.08 + activity * 0.28;
    if (activity <= 0.02) return;
    const attribute = ref.current?.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) return;
    for (let index = 0; index < count; index += 1) {
      let y = attribute.getY(index) + speeds[index] * delta * 0.35;
      if (y > 5.5) y = 0.25;
      attribute.setY(index, y);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#A6FFD1" size={0.028} sizeAttenuation transparent opacity={0.35} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function CityFog({ motion }: { motion: MotionRef }) {
  const { scene } = useThree();
  useFrame(() => {
    const city = motion.current?.city ?? 1;
    const fog = scene.fog;
    if (fog && "near" in fog) {
      fog.near = 3 + city * 8;
      fog.far = 12 + city * 40;
    }
  });
  return null;
}

function ReadyProbe({ onReady }: { onReady: () => void }) {
  useLayoutEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export default function VoxelScene({
  motion,
  journey,
  active,
  reducedMotion,
  scrollLive,
  onReady,
}: VoxelSceneProps) {
  const quality = useMemo<SceneQuality>(() => sceneQuality(), []);
  const layout = useMemo(() => buildScene(quality), [quality]);
  const detailed = quality === "high";

  return (
    <Canvas
      className="h-full w-full"
      dpr={detailed ? [1, 1.35] : 1}
      camera={{ fov: 30, near: 0.1, far: 80, position: [-3.15, 2.85, 10.6] }}
      gl={{
        antialias: detailed,
        alpha: false,
        stencil: false,
        powerPreference: detailed ? "high-performance" : "low-power",
        failIfMajorPerformanceCaveat: false,
      }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#020504", 1);
        gl.toneMappingExposure = 0.92;
        const current = motion.current;
        if (current) {
          camera.position.set(current.x, current.y, current.z);
          camera.lookAt(current.lookX, current.lookY, current.lookZ);
        }
      }}
    >
      <fog attach="fog" args={["#020504", 2, 8]} />
      <CityFog motion={motion} />
      <CameraRig motion={motion} journey={journey} reducedMotion={reducedMotion} scrollLive={scrollLive} />
      <Lights motion={motion} journey={journey} scrollLive={scrollLive} />
      <WetPlaza />
      <VoxelField matrices={layout.ground} tone="ground" />
      <VoxelField matrices={layout.stone} tone="stone" />
      <VoxelField matrices={layout.accent} tone="accent" />
      <Portal motion={motion} spec={layout.portal} journey={journey} scrollLive={scrollLive} />
      <Operative
        reducedMotion={reducedMotion}
        detailed={detailed}
        position={[layout.operative.x, layout.operative.y, layout.operative.z]}
        rotationY={layout.operative.rotY}
        motion={motion}
      />
      <VoxelFragments
        portal={layout.portal}
        journey={journey}
        scrollLive={scrollLive}
        count={detailed ? 12 : 6}
        motion={motion}
        reducedMotion={reducedMotion}
      />
      <DataBeams routes={layout.routes} />
      <PacketRoutes
        routes={layout.routes}
        reducedMotion={reducedMotion}
        count={detailed ? 28 : 12}
        journey={journey}
        motion={motion}
      />
      <DriftParticles
        count={detailed ? 36 : 14}
        motion={motion}
        journey={journey}
        reducedMotion={reducedMotion}
        scrollLive={scrollLive}
      />
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}
