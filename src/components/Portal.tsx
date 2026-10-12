import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial } from "three";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { PortalSpec } from "../lib/sceneLayout.ts";

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

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 cell = floor(vUv * vec2(12.0, 18.0));
    float n = hash(cell);
    float sweep = fract(vUv.y * 1.6 - uTime * 0.14);
    float row = step(0.58, fract(n * 6.5 + uTime * 0.2 + sweep));
    float glow = smoothstep(0.12, 1.0, n);
    vec3 deep = vec3(0.0, 0.08, 0.04);
    vec3 mid = vec3(0.04, 0.42, 0.22);
    vec3 hot = vec3(0.62, 1.0, 0.78);
    vec3 color = mix(deep, mid, glow);
    color = mix(color, hot, row * 0.82);
    float mask = smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x);
    mask *= smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
    float alpha = mask * (0.5 + 0.5 * clamp(uIntensity, 0.0, 1.0));
    gl_FragColor = vec4(color * (0.22 + 0.78 * clamp(uIntensity, 0.0, 1.0)), alpha);
  }
`;

type PortalProps = {
  motion: MotionRef;
  spec: PortalSpec;
};

export function Portal({ motion, spec }: PortalProps) {
  const anchor = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useLayoutEffect(() => {
    const group = anchor.current;
    if (!group) return;

    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.08 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const recess = new Mesh(
      new PlaneGeometry(spec.width + 0.12, spec.height + 0.12),
      new MeshBasicMaterial({ color: "#03110b" }),
    );
    recess.position.set(0, spec.y, -0.22);
    const gate = new Mesh(new PlaneGeometry(spec.width, spec.height), material);
    gate.position.set(0, spec.y, -0.05);
    group.add(recess, gate);
    materialRef.current = material;

    return () => {
      materialRef.current = null;
      recess.geometry.dispose();
      recess.material.dispose();
      gate.geometry.dispose();
      material.dispose();
      group.remove(recess, gate);
    };
  }, [spec]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uIntensity.value = motion.current?.intensity ?? 0;
  });

  return <group ref={anchor} />;
}
