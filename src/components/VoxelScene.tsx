import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ACESFilmicToneMapping, BufferAttribute, Group, Points, Vector2 } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { buildScene, sceneQuality, type SceneQuality } from "../lib/sceneLayout.ts";
import { PacketRoutes } from "./WorldLife.tsx";
import { Portal } from "./Portal.tsx";
import { NetworkTopology, SecuritySentinel, SENTINEL_POSITION } from "./SecurityField.tsx";

type JourneyRef = { current: SceneJourney };

type VoxelSceneProps = {
  motion: MotionRef;
  journey: JourneyRef;
  active: boolean;
  reducedMotion: boolean;
  scrollLive: boolean;
  onReady: () => void;
};

type Pose = {
  t: number;
  x: number;
  y: number;
  z: number;
  lx: number;
  ly: number;
  lz: number;
};

const CAMERA_PATH: Pose[] = [
  { t: 0, x: 0, y: 1.86, z: 7.45, lx: 0.15, ly: 2.45, lz: -0.35 },
  { t: 0.16, x: 0.08, y: 1.92, z: 4.4, lx: -0.15, ly: 2.15, lz: -1.2 },
  { t: 0.3, x: 0, y: 1.85, z: 0.7, lx: 0, ly: 1.8, lz: -6 },
  { t: 0.46, x: 0.25, y: 1.6, z: -7.5, lx: 0.1, ly: 1.55, lz: -15 },
  { t: 0.62, x: -0.1, y: 1.7, z: -15.5, lx: 0, ly: 1.7, lz: -24 },
  { t: 0.8, x: 0.1, y: 2.15, z: -26, lx: 0, ly: 1.9, lz: -36 },
  { t: 1, x: 0, y: 2.25, z: -34.5, lx: 0, ly: 2.1, lz: -42 },
];

function smoothMix(edge0: number, edge1: number, value: number) {
  const span = Math.max(0.0001, edge1 - edge0);
  const amount = Math.min(1, Math.max(0, (value - edge0) / span));
  return amount * amount * (3 - 2 * amount);
}

function samplePath(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  let index = 0;
  while (index < CAMERA_PATH.length - 2 && t > CAMERA_PATH[index + 1].t) index += 1;
  const from = CAMERA_PATH[index];
  const to = CAMERA_PATH[index + 1];
  const amount = smoothMix(from.t, to.t, t);
  const mix = (start: number, end: number) => start + (end - start) * amount;
  return {
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    z: mix(from.z, to.z),
    lx: mix(from.lx, to.lx),
    ly: mix(from.ly, to.ly),
    lz: mix(from.lz, to.lz),
  };
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

  useFrame(({ camera, clock }) => {
    const current = motion.current;
    if (!current) return;
    const drift = reducedMotion ? 0 : current.drift;
    const time = clock.elapsedTime;
    const live = scrollLive && !reducedMotion;
    const aim = live ? 1 : drift;
    pointer.current.x += ((aim ? journey.current.pointerX : 0) - pointer.current.x) * 0.035;
    pointer.current.y += ((aim ? journey.current.pointerY : 0) - pointer.current.y) * 0.035;
    const heroWeight = live ? 1 - Math.min(1, journey.current.depth * 2.4) : 1;
    const swayX = pointer.current.x * (0.06 + heroWeight * 0.16) * aim;
    const swayY = pointer.current.y * (0.03 + heroWeight * 0.05) * aim;
    if (!live) {
      camera.position.set(
        current.x + Math.sin(time * 0.12) * 0.1 * drift + swayX,
        current.y + Math.sin(time * 0.08) * 0.04 * drift - swayY,
        current.z,
      );
      camera.lookAt(0.15 + swayX * 0.35, current.lookY - swayY * 0.25, -0.35);
      return;
    }
    const pose = samplePath(journey.current.depth);
    camera.position.set(
      pose.x + Math.sin(time * 0.12) * 0.05 * drift + swayX,
      pose.y + Math.sin(time * 0.08) * 0.03 * drift - swayY,
      pose.z,
    );
    camera.lookAt(pose.lx + swayX * 0.28, pose.ly, pose.lz);
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
  const corridorLight = useRef<import("three").PointLight>(null);
  useFrame(({ clock }) => {
    const lamp = portalLight.current;
    if (!lamp || !motion.current) return;
    const pulse = scrollLive ? Math.sin(clock.elapsedTime * 0.7) * 0.18 : Math.sin(clock.elapsedTime * 0.45) * 0.08;
    const pass = scrollLive ? Math.sin(Math.min(1, journey.current.depth) * Math.PI) : 0;
    lamp.intensity = 0.7 + motion.current.intensity * 1.55 + pulse + pass * 0.8;
    if (corridorLight.current) {
      corridorLight.current.intensity = scrollLive ? 1.2 + journey.current.tunnel * 1.6 : 0.4;
    }
  });
  return (
    <>
      <ambientLight color="#17114A" intensity={0.72} />
      <hemisphereLight color="#7C3AED" groundColor="#05030A" intensity={0.45} />
      <directionalLight color="#C4B5FD" intensity={1.05} position={[-3, 8, 6]} />
      <directionalLight color="#40BFFF" intensity={0.28} position={[5.5, 2.2, 3.4]} />
      <pointLight
        ref={portalLight}
        color="#F02CB7"
        position={[SENTINEL_POSITION[0], SENTINEL_POSITION[1] + 0.2, SENTINEL_POSITION[2] + 1.35]}
        distance={12}
        decay={2}
      />
      <pointLight ref={corridorLight} color="#A855F7" position={[0, 1.8, -16]} distance={14} decay={2} />
    </>
  );
}

function DriftParticles({
  count,
  motion,
  journey,
  reducedMotion,
  scrollLive,
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
      data[index * 3] = (Math.random() - 0.5) * 14;
      data[index * 3 + 1] = 0.4 + Math.random() * 5;
      data[index * 3 + 2] = 6 - Math.random() * 42;
    }
    return data;
  });
  const [speeds] = useState(() => Float32Array.from({ length: count }, () => 0.15 + Math.random() * 0.45));
  const ref = useRef<Points>(null);
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const lite = document.documentElement.classList.contains("perf-lite");
    const activity = reducedMotion || lite ? 0 : (motion.current?.particles ?? 0);
    if (group.current && scrollLive) {
      group.current.position.x += (journey.current.pointerX * 0.18 - group.current.position.x) * 0.05;
      group.current.position.y += (-journey.current.pointerY * 0.08 - group.current.position.y) * 0.05;
    }
    const pointsMaterial = ref.current?.material;
    if (pointsMaterial && !Array.isArray(pointsMaterial)) pointsMaterial.opacity = 0.12 + activity * 0.58;
    if (activity <= 0.02) return;
    const attribute = ref.current?.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) return;
    for (let index = 0; index < count; index += 1) {
      let y = attribute.getY(index) + speeds[index] * delta * (0.12 + activity * 0.28);
      if (y > 6.4) y = 0.3;
      attribute.setY(index, y);
    }
    attribute.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#40BFFF" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
}

function ControlledBloom() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);

  useLayoutEffect(() => {
    const effect = new EffectComposer(gl);
    effect.setPixelRatio(gl.getPixelRatio());
    effect.setSize(size.width, size.height);
    effect.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), 0.18, 0.32, 0.92);
    effect.addPass(bloom);
    effect.addPass(new OutputPass());
    composer.current = effect;
    return () => {
      bloom.dispose();
      effect.dispose();
      composer.current = null;
    };
  }, [gl, scene, camera, size.width, size.height]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return null;
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

function FarMist({ children }: { children: ReactNode }) {
  return <group>{children}</group>;
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
  const heroPortal = useMemo(
    () => ({ ...layout.portal, x: 2.2, y: 2.35, z: -0.9, width: 2.2, height: 2.8 }),
    [layout.portal],
  );

  return (
    <Canvas
      className="h-full w-full"
      dpr={detailed ? [1, 1.5] : 1}
      camera={{ fov: 38, near: 0.1, far: 80, position: [0, 2.4, 12.5] }}
      gl={{
        antialias: detailed,
        alpha: false,
        stencil: false,
        powerPreference: detailed ? "high-performance" : "low-power",
        failIfMajorPerformanceCaveat: false,
      }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#05030A", 1);
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = detailed && !reducedMotion ? 1.12 : 1.28;
        const current = motion.current;
        if (current) {
          camera.position.set(current.x, current.y, current.z);
          camera.lookAt(0.15, current.lookY, -0.35);
        }
      }}
    >
      <fog attach="fog" args={["#05030A", 7, 28]} />
      <CameraRig motion={motion} journey={journey} reducedMotion={reducedMotion} scrollLive={scrollLive} />
      <Lights motion={motion} journey={journey} scrollLive={scrollLive} />
      <FarMist>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -10]}>
          <circleGeometry args={[22, 48]} />
          <meshStandardMaterial color="#05030A" metalness={0.72} roughness={0.46} />
        </mesh>
        <Portal motion={motion} spec={heroPortal} />
        <SecuritySentinel
          motion={motion}
          journey={journey}
          reducedMotion={reducedMotion}
          detailed={detailed}
        />
        <NetworkTopology detailed={detailed} reducedMotion={reducedMotion} journey={journey} />
        {detailed && !reducedMotion ? <ControlledBloom /> : null}
        <PacketRoutes
          routes={layout.routes}
          reducedMotion={reducedMotion}
          count={detailed ? 48 : 18}
          journey={journey}
          motion={motion}
        />
        <DriftParticles
          count={detailed ? 80 : 28}
          motion={motion}
          journey={journey}
          reducedMotion={reducedMotion}
          scrollLive={scrollLive}
        />
      </FarMist>
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}
