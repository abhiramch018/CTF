import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Group } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { PortalSpec } from "../lib/sceneLayout.ts";

export function EncryptedCore({
  motion,
  spec,
  reducedMotion,
  detailed,
}: {
  motion: MotionRef;
  spec: PortalSpec;
  reducedMotion: boolean;
  detailed: boolean;
}) {
  const shell = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = shell.current;
    if (!group) return;
    const spin = reducedMotion ? 0.35 : clock.elapsedTime * 0.14;
    group.rotation.y = spin;
    group.rotation.x = reducedMotion ? 0.18 : Math.sin(clock.elapsedTime * 0.18) * 0.07;
    const intensity = motion.current?.intensity ?? 0.2;
    group.scale.setScalar(0.92 + intensity * 0.1);
  });

  return (
    <group ref={shell} position={[spec.x, spec.y, spec.z]}>
      <mesh>
        <icosahedronGeometry args={[0.82, detailed ? 2 : 1]} />
        <meshStandardMaterial
          color="#17114A"
          emissive="#7C3AED"
          emissiveIntensity={0.42}
          metalness={0.64}
          roughness={0.16}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.22, 1]} />
        <meshStandardMaterial
          color="#241047"
          emissive="#A855F7"
          emissiveIntensity={0.18}
          metalness={0.28}
          roughness={0.32}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function NetworkTopology({
  detailed,
  reducedMotion,
}: {
  detailed: boolean;
  reducedMotion: boolean;
}) {
  const flow = useRef<Group>(null);
  const count = detailed ? 26 : 12;
  const nodes = useMemo(() => {
    const points: Array<[number, number, number]> = [];
    for (let index = 0; index < count; index += 1) {
      const angle = index * 1.18;
      const radius = 2.8 + (index % 4) * 0.32;
      points.push([
        Math.cos(angle) * radius,
        1.5 + Math.sin(angle * 0.75) * 0.65,
        3.4 - index * 1.7,
      ]);
    }
    return points;
  }, [count]);

  const lines = useMemo(() => {
    const positions: number[] = [];
    nodes.forEach((point, index) => {
      const next = nodes[index + 1];
      if (next) positions.push(point[0], point[1], point[2], next[0], next[1], next[2]);
      const bridge = nodes[index + 3];
      if (index % 3 === 0 && bridge) positions.push(point[0], point[1], point[2], bridge[0], bridge[1], bridge[2]);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (!flow.current || reducedMotion) return;
    flow.current.rotation.y = Math.sin(clock.elapsedTime * 0.07) * 0.035;
  });

  return (
    <group ref={flow}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#40BFFF" transparent opacity={0.32} />
      </lineSegments>
      {nodes.map((point, index) => (
        <mesh key={point.join("-")} position={point}>
          <sphereGeometry args={[index % 5 === 0 ? 0.08 : 0.04, 16, 12]} />
          <meshStandardMaterial
            color="#0B1240"
            emissive={index % 5 === 0 ? "#F02CB7" : "#A855F7"}
            emissiveIntensity={0.65}
            metalness={0.55}
            roughness={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}
