import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";

type OperativeProps = {
  reducedMotion: boolean;
  detailed: boolean;
  position: [number, number, number];
  rotationY: number;
  motion: MotionRef;
};

const VOID = "#020504";
const OBSIDIAN = "#06100C";
const FOREST = "#063A25";
const EMERALD = "#00B85C";
const PORTAL = "#00F07A";
const MINT = "#A6FFD1";

function Voxel({
  position,
  size,
  color,
  emissive = "#000000",
  intensity = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive?: string;
  intensity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={intensity}
        roughness={intensity > 0 ? 0.38 : 0.72}
        metalness={intensity > 0 ? 0.25 : 0.18}
        toneMapped={intensity === 0}
      />
    </mesh>
  );
}

export function Operative({ reducedMotion, detailed, position, rotationY, motion }: OperativeProps) {
  const root = useRef<Group>(null);
  const hood = useRef<Group>(null);
  const coat = useRef<Group>(null);
  const device = useRef<Mesh>(null);
  const beam = useRef<Mesh>(null);
  const baseY = position[1];

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const action = reducedMotion ? 1 : (motion.current?.action ?? 0);
    const figure = reducedMotion ? 1 : (motion.current?.figure ?? 1);
    const breathe = reducedMotion ? 0 : Math.sin(time * 0.9);
    if (root.current) {
      root.current.visible = figure > 0.04;
      root.current.scale.setScalar(Math.max(0.001, figure) * 1.05);
      root.current.position.y = baseY + breathe * 0.012;
      root.current.rotation.y = rotationY + breathe * 0.012;
    }
    if (hood.current) hood.current.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.28) * 0.04;
    if (coat.current && !reducedMotion) coat.current.rotation.x = Math.sin(time * 0.55) * 0.015;
    if (device.current) {
      const lamp = device.current.material;
      if (lamp instanceof MeshStandardMaterial) {
        lamp.emissiveIntensity = reducedMotion ? 0.35 : 0.28 + action * 0.35 + Math.sin(time * 1.4) * 0.06;
      }
    }
    if (beam.current) {
      beam.current.visible = action > 0.2;
      const surface = beam.current.material;
      if (surface instanceof MeshBasicMaterial) surface.opacity = action * 0.22;
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]} scale={1.05}>
      <Voxel position={[-0.16, 0.06, 0.02]} size={[0.2, 0.12, 0.28]} color={VOID} />
      <Voxel position={[0.16, 0.06, 0.02]} size={[0.2, 0.12, 0.28]} color={VOID} />
      <Voxel position={[-0.15, 0.38, 0]} size={[0.16, 0.46, 0.16]} color={FOREST} />
      <Voxel position={[0.15, 0.38, 0]} size={[0.16, 0.46, 0.16]} color={OBSIDIAN} />
      <group ref={coat}>
        <Voxel position={[0, 1.05, -0.04]} size={[0.42, 0.58, 0.24]} color={VOID} />
        <Voxel position={[0, 0.78, -0.18]} size={[0.48, 0.86, 0.08]} color={OBSIDIAN} emissive={EMERALD} intensity={0.08} />
        <Voxel position={[0, 0.92, -0.27]} size={[0.16, 0.18, 0.04]} color={EMERALD} emissive={PORTAL} intensity={0.75} />
        <Voxel position={[0, 0.92, -0.3]} size={[0.06, 0.07, 0.03]} color={MINT} emissive={PORTAL} intensity={0.9} />
        <Voxel position={[0, 0.42, -0.16]} size={[0.46, 0.28, 0.06]} color={VOID} />
        <Voxel position={[0, 1.12, 0.14]} size={[0.22, 0.16, 0.04]} color={EMERALD} emissive={PORTAL} intensity={0.45} />
        <Voxel position={[0, 1.18, 0.16]} size={[0.08, 0.1, 0.03]} color={MINT} emissive={PORTAL} intensity={0.7} />
        <Voxel position={[-0.06, 1.08, 0.16]} size={[0.05, 0.05, 0.03]} color={EMERALD} emissive={PORTAL} intensity={0.4} />
        <Voxel position={[0.06, 1.08, 0.16]} size={[0.05, 0.05, 0.03]} color={EMERALD} emissive={PORTAL} intensity={0.4} />
      </group>
      <Voxel position={[-0.38, 1.28, 0]} size={[0.18, 0.1, 0.22]} color={FOREST} />
      <Voxel position={[0.38, 1.28, 0.02]} size={[0.18, 0.1, 0.22]} color={FOREST} emissive={EMERALD} intensity={0.15} />
      <Voxel position={[-0.46, 0.95, 0.04]} size={[0.1, 0.42, 0.12]} color={OBSIDIAN} />
      <Voxel position={[0.48, 0.98, 0.16]} size={[0.1, 0.38, 0.12]} color={FOREST} />
      <mesh ref={device} position={[0.52, 0.82, 0.32]}>
        <boxGeometry args={[0.08, 0.06, 0.14]} />
        <meshStandardMaterial color={FOREST} emissive={EMERALD} emissiveIntensity={0.4} roughness={0.32} metalness={0.2} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0.15, 0.95, -0.15]} rotation={[0.35, -0.7, 0.04]} visible={false}>
        <boxGeometry args={[0.02, 0.02, 1.6]} />
        <meshBasicMaterial color={EMERALD} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={hood} position={[0, 1.58, 0.02]}>
        <Voxel position={[0, 0, 0]} size={[0.32, 0.28, 0.3]} color={VOID} />
        <Voxel position={[0, 0.16, -0.02]} size={[0.38, 0.08, 0.34]} color={OBSIDIAN} />
        <Voxel position={[0, 0.02, 0.16]} size={[0.2, 0.035, 0.03]} color={PORTAL} emissive={PORTAL} intensity={0.85} />
        {detailed ? <Voxel position={[0.1, 0.08, 0.16]} size={[0.035, 0.035, 0.02]} color={MINT} emissive={EMERALD} intensity={0.45} /> : null}
      </group>
    </group>
  );
}
