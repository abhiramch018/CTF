import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
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
    const open = scrollLive ? Math.max(smoothstep(0.48, 0.66, depth), journey.current.tunnel * 0.4) : 0;
    if (left.current) left.current.position.x = -1.05 - open * 0.85;
    if (right.current) right.current.position.x = 1.05 + open * 0.85;
  });

  return (
    <group position={[0, 0, z]}>
      <mesh position={[-1.7, 1.7, 0]}>
        <boxGeometry args={[0.32, 3.4, 0.36]} />
        <meshStandardMaterial color="#06100C" roughness={0.72} />
      </mesh>
      <mesh position={[1.7, 1.7, 0]}>
        <boxGeometry args={[0.32, 3.4, 0.36]} />
        <meshStandardMaterial color="#06100C" roughness={0.72} />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[3.7, 0.26, 0.36]} />
        <meshStandardMaterial color="#063A25" emissive="#00B85C" emissiveIntensity={0.22} />
      </mesh>
      <group ref={left} position={[-1.05, 0, 0]}>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[1.02, 3.05, 0.12]} />
          <meshStandardMaterial color="#020504" emissive="#00B85C" emissiveIntensity={0.12} />
        </mesh>
      </group>
      <group ref={right} position={[1.05, 0, 0]}>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[1.02, 3.05, 0.12]} />
          <meshStandardMaterial color="#020504" emissive="#00B85C" emissiveIntensity={0.12} />
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
      radius: 0.42 + (index % 3) * 0.16,
      lift: 0.15 + (index % 4) * 0.18,
      spin: 0.15 + (index % 3) * 0.05,
    })),
    [count],
  );

  useFrame(({ clock, camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const breach = scrollLive ? journey.current.breach : 0;
    mesh.visible = breach > 0.08;
    if (!mesh.visible) return;
    const time = reducedMotion ? 0 : clock.elapsedTime;
    seeds.forEach((seed, index) => {
      const travel = ((time * 0.18 + index / count) % 1) * Math.min(1, breach * 1.15);
      const originX = portal.x + Math.cos(seed.angle) * seed.radius * 0.35;
      const originY = portal.y + 1.55 + seed.lift * 0.15;
      const originZ = portal.z;
      scratch.position.set(
        originX + (camera.position.x - originX) * travel,
        originY + (camera.position.y * 0.7 - originY) * travel,
        originZ + (camera.position.z - 1.1 - originZ) * travel,
      );
      scratch.rotation.set(0, seed.angle + time * seed.spin, 0);
      scratch.scale.setScalar(0.08 + (1 - travel) * 0.08);
      scratch.updateMatrix();
      mesh.setMatrixAt(index, fragmentMatrix.copy(scratch.matrix));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#06100C" emissive="#00B85C" emissiveIntensity={0.55} roughness={0.4} metalness={0.2} />
    </instancedMesh>
  );
}

export function DataBeams({ routes }: { routes: Array<Array<[number, number, number]>> }) {
  const lines = useMemo(
    () => routes.map((route) => {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(new Float32Array(route.flat()), 3));
      const material = new LineBasicMaterial({ color: "#00B85C", transparent: true, opacity: 0.42 });
      return new Line(geometry, material);
    }),
    [routes],
  );

  return (
    <group>
      {lines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </group>
  );
}

export function PacketRoutes({
  routes,
  reducedMotion,
  count,
  motion,
}: {
  routes: Array<Array<[number, number, number]>>;
  reducedMotion: boolean;
  count: number;
  journey: JourneyRef;
  motion: MotionRef;
}) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }) => {
    const points = ref.current;
    const surface = points?.material;
    const action = reducedMotion ? 0.35 : Math.max(0.25, motion.current?.action ?? 0);
    if (surface && !Array.isArray(surface)) surface.opacity = 0.35 + action * 0.4;
    if (routes.length === 0) return;
    const attribute = points?.geometry.getAttribute("position");
    if (!(attribute instanceof BufferAttribute)) return;
    for (let index = 0; index < count; index += 1) {
      const route = routes[index % routes.length];
      const travel = (clock.elapsedTime * (reducedMotion ? 0 : 0.045) + index / count) % 1;
      const scaled = travel * (route.length - 1);
      const segment = Math.min(route.length - 2, Math.floor(scaled));
      const local = scaled - segment;
      const from = route[segment];
      const to = route[segment + 1];
      attribute.setXYZ(
        index,
        from[0] + (to[0] - from[0]) * local,
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
      <pointsMaterial color="#A6FFD1" size={0.045} transparent opacity={0.75} depthWrite={false} toneMapped={false} sizeAttenuation />
    </points>
  );
}
