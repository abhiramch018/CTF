import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BoxGeometry,
  BufferAttribute,
  EdgesGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  Points,
} from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import type { PortalSpec } from "../lib/sceneLayout.ts";

type JourneyRef = { current: SceneJourney };

const scratch = new Object3D();
const fragmentMatrix = new Matrix4();

function smoothstep(edge0: number, edge1: number, value: number) {
  const span = Math.max(0.0001, edge1 - edge0);
  const t = Math.min(1, Math.max(0, (value - edge0) / span));
  return t * t * (3 - 2 * t);
}

export function FirewallGate({
  z,
  journey,
  scrollLive,
}: {
  z: number;
  journey: JourneyRef;
  scrollLive: boolean;
}) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);

  useFrame(() => {
    const depth = scrollLive ? journey.current.depth : 0;
    const open = scrollLive ? Math.max(smoothstep(0.5, 0.64, depth), journey.current.tunnel) : 0;
    if (left.current) left.current.position.x = -1.05 - open * 1.45;
    if (right.current) right.current.position.x = 1.05 + open * 1.45;
  });

  return (
    <group position={[0, 0, z]}>
      <mesh position={[-1.7, 1.7, 0]}>
        <boxGeometry args={[0.35, 3.4, 0.4]} />
        <meshStandardMaterial color="#02160f" roughness={0.7} />
      </mesh>
      <mesh position={[1.7, 1.7, 0]}>
        <boxGeometry args={[0.35, 3.4, 0.4]} />
        <meshStandardMaterial color="#02160f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[3.8, 0.32, 0.4]} />
        <meshStandardMaterial color="#053D24" emissive="#00F07A" emissiveIntensity={0.35} />
      </mesh>
      <group ref={left} position={[-1.05, 0, 0]}>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[1.05, 3.1, 0.18]} />
          <meshStandardMaterial color="#010604" emissive="#00B85C" emissiveIntensity={0.2} />
        </mesh>
      </group>
      <group ref={right} position={[1.05, 0, 0]}>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[1.05, 3.1, 0.18]} />
          <meshStandardMaterial color="#010604" emissive="#00B85C" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export function VoxelFragments({
  portal,
  journey,
  scrollLive,
  count,
  motion,
  reducedMotion,
}: {
  portal: PortalSpec;
  journey: JourneyRef;
  scrollLive: boolean;
  count: number;
  motion: MotionRef;
  reducedMotion: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, index) => ({
      angle: (index / count) * Math.PI * 2,
      lift: (index % 5) * 0.22,
      spin: 0.4 + (index % 4) * 0.15,
    })),
    [count],
  );

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const depth = scrollLive ? journey.current.depth : 0;
    const burst = scrollLive ? smoothstep(0.12, 0.34, depth) * (1 - smoothstep(0.4, 0.55, depth)) : 0;
    const title = scrollLive ? smoothstep(0.45, 0.75, journey.current.hero) : 0;
    const action = reducedMotion ? 1 : (motion.current?.action ?? 0);
    seeds.forEach((seed, index) => {
      const introSpread = 2.7 - action * 1.9;
      const spread = scrollLive ? 0.85 + burst * 2.4 + title * 1.1 : introSpread;
      const y = portal.y - 0.4 + Math.sin(seed.angle) * (scrollLive ? 0.9 : 0.4 + (1 - action) * 0.85) + seed.lift * (scrollLive ? burst : action);
      scratch.position.set(
        portal.x + Math.cos(seed.angle) * spread,
        y + (scrollLive ? title * (index % 3) * 0.25 : action * Math.sin(seed.angle * 2) * 0.12),
        portal.z + Math.sin(seed.angle) * 0.35 + (scrollLive ? burst * 1.4 : (1 - action) * 1.7),
      );
      scratch.rotation.set(0, reducedMotion ? 0 : clock.elapsedTime * seed.spin * (0.2 + action), 0);
      const size = scrollLive ? 0.12 + (1 - burst) * 0.05 : 0.035 + action * 0.12;
      scratch.scale.setScalar(size);
      scratch.updateMatrix();
      mesh.setMatrixAt(index, fragmentMatrix.copy(scratch.matrix));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#053D24" emissive="#52FF9A" emissiveIntensity={1.1} roughness={0.45} toneMapped={false} />
    </instancedMesh>
  );
}

export function PacketRoutes({
  routes,
  reducedMotion,
  count,
  journey,
  motion,
}: {
  routes: Array<Array<[number, number, number]>>;
  reducedMotion: boolean;
  count: number;
  journey: JourneyRef;
  motion: MotionRef;
}) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    if (routes.length === 0) return data;
    for (let index = 0; index < count; index += 1) {
      const route = routes[index % routes.length];
      const point = route[index % route.length];
      data[index * 3] = point[0];
      data[index * 3 + 1] = point[1];
      data[index * 3 + 2] = point[2];
    }
    return data;
  }, [count, routes]);

  useFrame(({ clock }) => {
    const points = ref.current;
    const surface = points?.material;
    const action = reducedMotion ? 0.4 : (motion.current?.action ?? 0);
    if (surface && !Array.isArray(surface)) surface.opacity = 0.05 + action * 0.85;
    if (reducedMotion || routes.length === 0) return;
    const attribute = points?.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) return;
    const sway = journey.current.pointerX * 0.08;
    for (let index = 0; index < count; index += 1) {
      const route = routes[index % routes.length];
      const travel = (clock.elapsedTime * (0.015 + action * 0.07) + index / count) % 1;
      const scaled = travel * (route.length - 1);
      const segment = Math.min(route.length - 2, Math.floor(scaled));
      const local = scaled - segment;
      const from = route[segment];
      const to = route[segment + 1];
      attribute.setXYZ(
        index,
        from[0] + (to[0] - from[0]) * local + sway,
        from[1] + (to[1] - from[1]) * local,
        from[2] + (to[2] - from[2]) * local,
      );
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00F07A" size={0.055} transparent opacity={0.9} depthWrite={false} toneMapped={false} sizeAttenuation />
    </points>
  );
}

function WireKey({ position, reducedMotion }: { position: [number, number, number]; reducedMotion: boolean }) {
  const ref = useRef<Group>(null);
  const geometry = useMemo(() => new EdgesGeometry(new BoxGeometry(0.36, 0.2, 0.08)), []);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    group.rotation.y = clock.elapsedTime * 0.45;
    group.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.07;
  });

  return (
    <group ref={ref} position={position}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#B5FFE0" toneMapped={false} />
      </lineSegments>
    </group>
  );
}

export function SignalLife({
  reducedMotion,
  detailed,
  motion,
}: {
  reducedMotion: boolean;
  detailed: boolean;
  motion: MotionRef;
}) {
  const droneA = useRef<Group>(null);
  const droneB = useRef<Group>(null);
  const keys = detailed
    ? [[-2.4, 2.3, 2.4], [2.8, 2.5, 0.4], [-1.2, 2.4, -28], [1.4, 2.8, -38]]
    : [[-2.2, 2.2, 2.2], [1.6, 2.4, -28]];

  useFrame(({ clock }) => {
    const action = reducedMotion ? 1 : (motion.current?.action ?? 0);
    const scale = 0.15 + action * 0.85;
    if (droneA.current) droneA.current.scale.setScalar(scale);
    if (droneB.current) droneB.current.scale.setScalar(scale);
    if (reducedMotion) return;
    const time = clock.elapsedTime;
    if (droneA.current) {
      droneA.current.position.y = 3.15 + Math.sin(time * 0.8) * 0.12;
      droneA.current.position.x = -4.2 + Math.sin(time * 0.35) * 0.35;
    }
    if (droneB.current) {
      droneB.current.position.y = 3.4 + Math.sin(time * 0.7 + 1) * 0.1;
      droneB.current.position.x = 4.1 + Math.sin(time * 0.3) * 0.3;
    }
  });

  return (
    <group>
      <group ref={droneA} position={[-4.2, 3.15, 0.6]}>
        <mesh>
          <boxGeometry args={[0.28, 0.08, 0.28]} />
          <meshStandardMaterial color="#02160f" emissive="#00F07A" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      </group>
      <group ref={droneB} position={[4.1, 3.4, -6]}>
        <mesh>
          <boxGeometry args={[0.24, 0.08, 0.24]} />
          <meshStandardMaterial color="#02160f" emissive="#52FF9A" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      </group>
      {keys.map((position) => (
        <WireKey
          key={position.join(":")}
          position={position as [number, number, number]}
          reducedMotion={reducedMotion}
        />
      ))}
      <mesh position={[-0.35, 3.4, 1.15]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[0.55, 5.5]} />
        <meshBasicMaterial color="#00F07A" transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[1.4, 2.6, -16]} rotation={[0.4, 0.2, 0]}>
        <planeGeometry args={[0.4, 4.2]} />
        <meshBasicMaterial color="#52FF9A" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
      </mesh>
      <HoloFlag position={[-3.15, 1.7, 3.35]} reducedMotion={reducedMotion} motion={motion} />
      <HoloFlag position={[-2.1, 2.35, -27.2]} reducedMotion={reducedMotion} motion={motion} />
      <HoloFlag position={[2.3, 2.35, -32.2]} reducedMotion={reducedMotion} motion={motion} />
    </group>
  );
}

function HoloFlag({
  position,
  reducedMotion,
  motion,
}: {
  position: [number, number, number];
  reducedMotion: boolean;
  motion: MotionRef;
}) {
  const cloth = useRef<Group>(null);
  useFrame(({ clock }) => {
    const flag = cloth.current;
    if (!flag) return;
    const action = reducedMotion ? 1 : (motion.current?.action ?? 0);
    flag.scale.setScalar(0.12 + action * 0.88);
    if (reducedMotion) return;
    flag.rotation.y = Math.sin(clock.elapsedTime * 0.9) * 0.12 * action;
  });
  return (
    <group position={position}>
      <group ref={cloth} position={[0.22, 0.15, 0]}>
        <mesh>
          <planeGeometry args={[0.46, 0.28]} />
          <meshBasicMaterial color="#00F07A" transparent opacity={0.72} depthWrite={false} toneMapped={false} side={2} />
        </mesh>
      </group>
    </group>
  );
}
