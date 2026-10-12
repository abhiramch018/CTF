import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";

type OperativeProps = {
  reducedMotion: boolean;
  detailed: boolean;
  position: [number, number, number];
  rotationY: number;
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

export function Operative({ reducedMotion, detailed, position, rotationY }: OperativeProps) {
  const root = useRef<Group>(null);
  const hood = useRef<Group>(null);
  const coat = useRef<Group>(null);
  const device = useRef<Mesh>(null);
  const baseY = position[1];

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const breathe = reducedMotion ? 0 : Math.sin(time * 1.25);
    if (root.current) {
      root.current.position.y = baseY + breathe * 0.018;
      root.current.rotation.z = breathe * 0.012;
    }
    if (hood.current && !reducedMotion) hood.current.rotation.y = Math.sin(time * 0.42) * 0.07;
    if (coat.current && !reducedMotion) {
      coat.current.rotation.x = Math.sin(time * 0.9) * 0.035;
      coat.current.rotation.z = Math.sin(time * 0.7) * 0.02;
    }
    const lamp = device.current?.material;
    if (lamp instanceof MeshStandardMaterial && !reducedMotion) {
      lamp.emissiveIntensity = 0.85 + Math.sin(time * 3.1) * 0.35;
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]} scale={1.05}>
      <Voxel position={[-0.18, 0.06, 0.04]} size={[0.18, 0.12, 0.24]} color="#010604" />
      <Voxel position={[0.18, 0.06, 0.02]} size={[0.18, 0.12, 0.24]} color="#010604" />
      <Voxel position={[-0.18, 0.3, 0.02]} size={[0.14, 0.34, 0.15]} color="#0a3a24" />
      <Voxel position={[0.18, 0.3, 0]} size={[0.14, 0.34, 0.15]} color="#053D24" />
      <Voxel position={[-0.16, 0.6, 0]} size={[0.15, 0.26, 0.16]} color="#02160f" />
      <Voxel position={[0.18, 0.58, 0.04]} size={[0.15, 0.28, 0.16]} color="#032117" />
      <group ref={coat}>
        <Voxel position={[0, 0.96, 0.02]} size={[0.46, 0.46, 0.24]} color="#02140c" />
        <Voxel position={[0, 1.0, 0.15]} size={[0.28, 0.22, 0.05]} color="#00B85C" emissive="#00F07A" intensity={0.85} />
        <Voxel position={[0, 0.72, -0.16]} size={[0.56, 0.78, 0.06]} color="#010604" />
        <Voxel position={[0.04, 0.36, -0.18]} size={[0.4, 0.32, 0.05]} color="#02160f" />
        {detailed ? <Voxel position={[0, 1.16, -0.1]} size={[0.32, 0.08, 0.14]} color="#053D24" /> : null}
      </group>
      <Voxel position={[-0.34, 1.14, 0.04]} size={[0.18, 0.12, 0.22]} color="#00B85C" emissive="#00F07A" intensity={0.35} />
      <Voxel position={[0.34, 1.14, 0.06]} size={[0.18, 0.12, 0.22]} color="#00B85C" emissive="#00F07A" intensity={0.35} />
      <Voxel position={[-0.46, 0.86, 0.08]} size={[0.12, 0.38, 0.12]} color="#02140c" />
      <Voxel position={[0.48, 0.88, 0.22]} size={[0.12, 0.34, 0.12]} color="#0a3a24" />
      <mesh ref={device} position={[0.5, 0.68, 0.42]}>
        <boxGeometry args={[0.1, 0.08, 0.16]} />
        <meshStandardMaterial color="#053D24" emissive="#52FF9A" emissiveIntensity={1} roughness={0.35} toneMapped={false} />
      </mesh>
      <group ref={hood} position={[0, 1.42, 0.03]}>
        <Voxel position={[0, 0, 0]} size={[0.3, 0.28, 0.28]} color="#010604" />
        <Voxel position={[0, 0.02, 0.15]} size={[0.2, 0.055, 0.04]} color="#52FF9A" emissive="#00F07A" intensity={1.15} />
        <Voxel position={[0, 0.18, -0.02]} size={[0.36, 0.1, 0.32]} color="#02140c" />
        {detailed ? <Voxel position={[0.12, 0.04, 0.16]} size={[0.05, 0.05, 0.03]} color="#B5FFE0" emissive="#52FF9A" intensity={0.8} /> : null}
      </group>
    </group>
  );
}
