import { Canvas, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BufferAttribute, Color, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Points } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { buildScene, sceneQuality, type SceneQuality } from "../lib/sceneLayout.ts";
import { Portal } from "./Portal.tsx";

type JourneyRef = { current: SceneJourney };

type VoxelSceneProps = {
  motion: MotionRef;
  journey: JourneyRef;
  active: boolean;
  reducedMotion: boolean;
  scrollLive: boolean;
  onReady: () => void;
};

function CameraRig({
  motion,
  journey,
  reducedMotion,
  scrollLive,
  scale,
}: {
  motion: MotionRef;
  journey: JourneyRef;
  reducedMotion: boolean;
  scrollLive: boolean;
  scale: number;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ camera, clock }) => {
    const current = motion.current;
    if (!current) return;
    const drift = reducedMotion ? 0 : current.drift;
    const time = clock.elapsedTime;
    const live = scrollLive && !reducedMotion;
    const hero = live ? journey.current.hero : 0;
    const finale = live ? journey.current.finale : 0;
    const push = hero * (1 - finale * 0.85);
    pointer.current.x += ((live ? journey.current.pointerX : 0) - pointer.current.x) * 0.06;
    pointer.current.y += ((live ? journey.current.pointerY : 0) - pointer.current.y) * 0.06;
    camera.position.set(
      current.x + Math.sin(time * 0.17) * 0.08 * drift + push * 0.52 * scale - finale * 0.18 * scale + pointer.current.x * 0.1 * scale,
      current.y + Math.sin(time * 0.11) * 0.035 * drift - pointer.current.y * 0.04 * scale,
      Math.max(6.4, current.z - push * 0.62 * scale),
    );
    camera.lookAt(0.15 + push * 0.32 * scale - finale * 0.22 * scale, current.lookY, 0);
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
  const light = useRef<import("three").PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current || !motion.current) return;
    const base = 3.5 + motion.current.intensity * 9;
    if (!scrollLive) {
      light.current.intensity = base;
      return;
    }
    const pulse = Math.sin(clock.elapsedTime * 1.15) * 0.28;
    const hero = journey.current.hero;
    const finale = journey.current.finale;
    light.current.intensity = base + pulse - hero * 1.1 + finale * 2.2;
  });
  return (
    <>
      <ambientLight color="#10241a" intensity={0.42} />
      <directionalLight color="#d7ece2" intensity={0.2} position={[5, 8, 7]} />
      <pointLight ref={light} color="#39ff88" position={[0, 2.7, 1.5]} distance={15} decay={2} />
    </>
  );
}

function VoxelField({
  matrices,
  tone,
  scrollLive = false,
}: {
  matrices: Matrix4[];
  tone: "dark" | "accent";
  scrollLive?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
    if (tone === "dark") {
      const color = new Color();
      matrices.forEach((_, index) => {
        const lift = (index % 6) * 0.012;
        color.setRGB(0.04 + lift, 0.07 + lift * 1.35, 0.05 + lift);
        mesh.setColorAt(index, color);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [matrices, tone]);

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (!material || tone !== "accent") return;
    material.emissiveIntensity = scrollLive ? 0.22 + Math.sin(clock.elapsedTime * 1.35) * 0.07 : 0.28;
  });

  if (matrices.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}>
      <boxGeometry args={[0.46, 0.46, 0.46]} />
      {tone === "dark" ? (
        <meshStandardMaterial roughness={0.94} metalness={0.04} />
      ) : (
        <meshStandardMaterial
          ref={materialRef}
          color="#143226"
          emissive="#39ff88"
          emissiveIntensity={0.28}
          roughness={0.7}
          toneMapped={false}
        />
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
  reducedMotion: boolean;
}) {
  const [positions] = useState(() => {
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 6.2;
      data[index * 3 + 1] = 0.4 + Math.random() * 5;
      data[index * 3 + 2] = Math.random() * 5.5;
    }
    return data;
  });
  const [speeds] = useState(() => Float32Array.from({ length: count }, () => 0.22 + Math.random() * 0.65));
  const ref = useRef<Points>(null);

  useFrame((_, delta) => {
    const activity = reducedMotion ? 0 : (motion.current?.particles ?? 0);
    if (activity <= 0.02) return;
    const attribute = ref.current?.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) return;
    for (let index = 0; index < count; index += 1) {
      let z = attribute.getZ(index) - speeds[index] * delta * (0.35 + activity);
      if (z < -0.15) {
        z = 4.2 + Math.random() * 2.2;
        attribute.setX(index, (Math.random() - 0.5) * 5.2);
        attribute.setY(index, 0.7 + Math.random() * 4.2);
      }
      attribute.setZ(index, z);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#39ff88"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function DepthLayer({
  shift,
  journey,
  scrollLive,
  children,
}: {
  shift: number;
  journey: JourneyRef;
  scrollLive: boolean;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const hero = scrollLive ? journey.current.hero : 0;
    group.position.x = hero * shift;
    group.position.z = hero * shift * 0.35;
  });
  return <group ref={ref}>{children}</group>;
}

function ReadyProbe({ onReady }: { onReady: () => void }) {
  const sent = useRef(false);
  useFrame(() => {
    if (sent.current) return;
    sent.current = true;
    onReady();
  });
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
  const depthScale = quality === "high" ? 1 : 0.4;

  return (
    <Canvas
      className="h-full w-full"
      dpr={quality === "high" ? [1, 1.5] : 1}
      camera={{ fov: 38, near: 0.1, far: 42, position: [0, 2.4, 12.5] }}
      gl={{
        antialias: quality === "high",
        alpha: false,
        stencil: false,
        powerPreference: quality === "high" ? "high-performance" : "low-power",
        failIfMajorPerformanceCaveat: false,
      }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#050806", 1);
        camera.lookAt(0.15, 2.55, 0);
      }}
    >
      <fog attach="fog" args={["#050806", 8, 23]} />
      <CameraRig
        motion={motion}
        journey={journey}
        reducedMotion={reducedMotion}
        scrollLive={scrollLive}
        scale={depthScale}
      />
      <Lights motion={motion} journey={journey} scrollLive={scrollLive} />
      <DepthLayer journey={journey} scrollLive={scrollLive} shift={-0.42 * depthScale}>
        <VoxelField matrices={layout.background} tone="dark" />
      </DepthLayer>
      <DepthLayer journey={journey} scrollLive={scrollLive} shift={0.1 * depthScale}>
        <VoxelField matrices={layout.frame} tone="dark" />
        <VoxelField matrices={layout.accent} tone="accent" scrollLive={scrollLive} />
        <Portal motion={motion} spec={layout.portal} />
      </DepthLayer>
      <DepthLayer journey={journey} scrollLive={scrollLive} shift={0.55 * depthScale}>
        <VoxelField matrices={layout.foreground} tone="dark" />
      </DepthLayer>
      <DriftParticles count={quality === "high" ? 70 : 26} motion={motion} reducedMotion={reducedMotion} />
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}
