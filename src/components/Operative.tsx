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
    <mesh position={position} castShadow={false}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={intensity}
        roughness={0.58}
        metalness={0.12}
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
    const action = reducedMotion ? 0 : (motion.current?.action ?? 0);
    const breathe = reducedMotion ? 0 : Math.sin(time * 1.25);
    if (root.current) {
      root.current.position.y = baseY + breathe * 0.018;
      root.current.rotation.z = breathe * 0.012;
      root.current.rotation.y = rotationY - action * 0.18;
    }
    if (hood.current) hood.current.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.42) * 0.07 - action * 0.46;
    if (coat.current && !reducedMotion) {
      coat.current.rotation.x = Math.sin(time * 0.9) * 0.035 + action * 0.04;
      coat.current.rotation.z = Math.sin(time * 0.7) * 0.02;
    }
    if (device.current) {
      device.current.position.z = 0.42 + action * 0.18;
      device.current.position.y = 0.68 + action * 0.06;
      const lamp = device.current.material;
      if (lamp instanceof MeshStandardMaterial) {
        lamp.emissiveIntensity = reducedMotion ? 0.55 : 0.28 + action * 1.55 + Math.sin(time * 6.2) * 0.22 * Math.max(action, 0.15);
      }
    }
    if (beam.current) {
      beam.current.visible = action > 0.05;
      beam.current.scale.set(0.4 + action, 0.45 + action * 0.4, 0.2 + action * 1.65);
      const surface = beam.current.material;
      if (surface instanceof MeshBasicMaterial) surface.opacity = action * 0.45;
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]} scale={1.05}>
      <Voxel position={[-0.18, 0.06, 0.04]} size={[0.18, 0.12, 0.24]} color="#05030A" />
      <Voxel position={[0.18, 0.06, 0.02]} size={[0.18, 0.12, 0.24]} color="#05030A" />
      <Voxel position={[-0.18, 0.3, 0.02]} size={[0.14, 0.34, 0.15]} color="#241047" />
      <Voxel position={[0.18, 0.3, 0]} size={[0.14, 0.34, 0.15]} color="#17114A" />
      <Voxel position={[-0.16, 0.6, 0]} size={[0.15, 0.26, 0.16]} color="#0B1240" />
      <Voxel position={[0.18, 0.58, 0.04]} size={[0.15, 0.28, 0.16]} color="#17114A" />
      <group ref={coat}>
        <Voxel position={[0, 0.96, 0.02]} size={[0.46, 0.46, 0.24]} color="#05030A" />
        <Voxel position={[0, 1.0, 0.15]} size={[0.28, 0.22, 0.05]} color="#7C3AED" emissive="#F02CB7" intensity={0.85} />
        <Voxel position={[0, 0.72, -0.16]} size={[0.56, 0.78, 0.06]} color="#05030A" />
        <Voxel position={[0.04, 0.36, -0.18]} size={[0.4, 0.32, 0.05]} color="#0B1240" />
        {detailed ? <Voxel position={[0, 1.16, -0.1]} size={[0.32, 0.08, 0.14]} color="#17114A" /> : null}
      </group>
      <Voxel position={[-0.34, 1.14, 0.04]} size={[0.18, 0.12, 0.22]} color="#7C3AED" emissive="#A855F7" intensity={0.35} />
      <Voxel position={[0.34, 1.14, 0.06]} size={[0.18, 0.12, 0.22]} color="#7C3AED" emissive="#A855F7" intensity={0.35} />
      <Voxel position={[-0.46, 0.86, 0.08]} size={[0.12, 0.38, 0.12]} color="#05030A" />
      <Voxel position={[0.48, 0.88, 0.22]} size={[0.12, 0.34, 0.12]} color="#241047" />
      <mesh ref={device} position={[0.5, 0.68, 0.42]}>
        <boxGeometry args={[0.1, 0.08, 0.16]} />
        <meshStandardMaterial color="#17114A" emissive="#A855F7" emissiveIntensity={0.35} roughness={0.35} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0.05, 0.78, 0.2]} rotation={[0.42, -0.85, 0.05]} visible={false}>
        <boxGeometry args={[0.045, 0.03, 1.25]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={hood} position={[0, 1.42, 0.03]}>
        <Voxel position={[0, 0, 0]} size={[0.3, 0.28, 0.28]} color="#05030A" />
        <Voxel position={[0, 0.02, 0.15]} size={[0.2, 0.055, 0.04]} color="#40BFFF" emissive="#40BFFF" intensity={1.15} />
        <Voxel position={[0, 0.18, -0.02]} size={[0.36, 0.1, 0.32]} color="#05030A" />
        {detailed ? <Voxel position={[0.12, 0.04, 0.16]} size={[0.05, 0.05, 0.03]} color="#C4B5FD" emissive="#A855F7" intensity={0.8} /> : null}
      </group>
    </group>
  );
}
