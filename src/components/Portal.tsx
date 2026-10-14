import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { CircleGeometry, Group, Mesh, ShaderMaterial } from "three";
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
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float radius = length(centered * vec2(0.72, 1.0));
    float pull = smoothstep(1.05, 0.15, radius);
    vec2 warped = vUv + centered * pull * (0.035 + 0.02 * sin(uTime * 0.8));
    warped.x += sin(warped.y * 18.0 + uTime * 0.85) * 0.018 * pull;
    warped.y += sin(warped.x * 14.0 - uTime * 0.55) * 0.012 * pull;

    float gate = smoothstep(1.02, 0.08, length((warped * 2.0 - 1.0) * vec2(0.7, 1.0)));
    float stream = smoothstep(0.07, 0.0, abs(fract(warped.y * 4.0 - uTime * 0.22) - 0.5));
    float ring = smoothstep(0.03, 0.0, abs(radius - 0.55 - sin(uTime * 0.6) * 0.03));
    float rune = step(0.86, hash(floor(warped * vec2(18.0, 32.0) + uTime * 0.15))) * gate;
    vec3 deep = vec3(0.043, 0.071, 0.251);
    vec3 mid = vec3(0.486, 0.227, 0.929);
    vec3 hot = vec3(0.941, 0.173, 0.718);
    vec3 flash = vec3(0.659, 0.333, 0.969);
    vec3 color = mix(deep, mid, gate);
    color = mix(color, hot, stream * 0.85 + ring * 0.55);
    color = mix(color, flash, rune * 0.7);
    float alpha = gate * (0.55 + 0.45 * clamp(uIntensity, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
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
    const radius = Math.min(spec.width, spec.height) * 0.34;
    const gate = new Mesh(new CircleGeometry(radius, 64), material);
    gate.position.set(0, spec.y, 0);
    group.add(gate);
    materialRef.current = material;

    return () => {
      materialRef.current = null;
      group.children.forEach((child) => {
        if (!(child instanceof Mesh)) return;
        child.geometry.dispose();
        const surface = child.material;
        if (Array.isArray(surface)) surface.forEach((item) => item.dispose());
        else surface.dispose();
      });
      group.clear();
    };
  }, [spec]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uIntensity.value = motion.current?.intensity ?? 0;
  });

  return <group ref={anchor} position={[spec.x, 0, spec.z]} />;
}
