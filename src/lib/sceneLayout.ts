import { Matrix4, Object3D } from "three";

const dummy = new Object3D();
const BLOCK = 0.5;

export type SceneQuality = "low" | "high";

export type PortalSpec = {
  width: number;
  height: number;
  y: number;
};

export type SceneLayout = {
  background: Matrix4[];
  frame: Matrix4[];
  accent: Matrix4[];
  foreground: Matrix4[];
  portal: PortalSpec;
};

function stamp(x: number, y: number, z: number, scale = 1) {
  dummy.position.set(x, y, z);
  dummy.scale.setScalar(scale);
  dummy.rotation.set(0, 0, 0);
  dummy.updateMatrix();
  return dummy.matrix.clone();
}

export function sceneQuality(): SceneQuality {
  const narrow = window.matchMedia("(max-width: 760px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (narrow || cores <= 4 || memory <= 4) return "low";
  return "high";
}

export function buildScene(quality: SceneQuality): SceneLayout {
  const background: Matrix4[] = [];
  const frame: Matrix4[] = [];
  const accent: Matrix4[] = [];
  const foreground: Matrix4[] = [];
  const half = quality === "high" ? 5 : 4;
  const rows = quality === "high" ? 12 : 10;

  for (let y = 0; y < rows; y += 1) {
    for (let x = -half; x <= half; x += 1) {
      const border = Math.abs(x) >= half - 1 || y < 2 || y >= rows - 2;
      if (!border) continue;
      const lip = Math.abs(x) === half - 1 || y === 2 || y === rows - 3;
      const jitter = (Math.abs(x) + y) % 5 === 0 ? -0.14 : 0.02;
      const py = y * BLOCK + 0.16;
      const px = x * BLOCK;
      if (lip && (x + y) % 2 === 0) accent.push(stamp(px, py, jitter + 0.08, 0.96));
      else frame.push(stamp(px, py, jitter, (x + y) % 4 === 0 ? 0.94 : 1));
    }
  }

  const extent = quality === "high" ? 11 : 7;
  const depth = quality === "high" ? 10 : 6;
  for (let x = -extent; x <= extent; x += 1) {
    for (let z = 3; z <= depth; z += 1) {
      if (Math.abs(x) <= half + 1 && z <= 5) continue;
      const drop = (x + z) % 7 === 0 ? -0.14 : 0;
      background.push(stamp(x * BLOCK, drop, z * BLOCK, (x * z) % 8 === 0 ? 0.9 : 1));
    }
  }

  for (let step = 0; step < 4; step += 1) {
    const span = 4 - Math.floor(step / 2);
    for (let x = -span; x <= span; x += 1) {
      foreground.push(stamp(x * BLOCK, step * 0.24, 0.72 + step * 0.5, 0.98));
    }
  }

  const columns =
    quality === "high"
      ? [
          [-4.4, 4, 2.2],
          [-3.6, 2, 3.1],
          [4.1, 3, 2.4],
          [3.3, 5, 3.4],
        ]
      : [
          [-3.4, 3, 2.4],
          [3.4, 2, 2.6],
        ];

  for (const [x, height, z] of columns) {
    for (let y = 0; y < height; y += 1) {
      background.push(stamp(x, y * BLOCK + 0.16, z, y === height - 1 ? 0.86 : 1));
    }
  }

  const openingWidth = ((half - 1) * 2 - 1) * BLOCK * 0.92;
  const openingHeight = (rows - 4) * BLOCK * 0.86;
  const portalY = ((rows - 1) / 2) * BLOCK + 0.16;

  return {
    background,
    frame,
    accent,
    foreground,
    portal: {
      width: openingWidth,
      height: openingHeight,
      y: portalY,
    },
  };
}
