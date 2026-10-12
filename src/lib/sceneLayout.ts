import { Matrix4, Object3D } from "three";

const dummy = new Object3D();

export type SceneQuality = "low" | "high";

export type PortalSpec = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
};

export type OperativeSpec = {
  x: number;
  y: number;
  z: number;
  rotY: number;
};

export type SceneLayout = {
  ground: Matrix4[];
  stone: Matrix4[];
  accent: Matrix4[];
  portal: PortalSpec;
  operative: OperativeSpec;
  gateZ: number;
  routes: Array<Array<[number, number, number]>>;
};

function place(x: number, y: number, z: number, sx: number, sy: number, sz: number) {
  dummy.position.set(x, y, z);
  dummy.scale.set(sx, sy, sz);
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
  const ground: Matrix4[] = [];
  const stone: Matrix4[] = [];
  const accent: Matrix4[] = [];
  const step = quality === "high" ? 1 : 2;
  const portal: PortalSpec = { x: -0.35, y: 2.05, z: 1.15, width: 2.35, height: 3.2 };
  const operative: OperativeSpec = {
    x: 1.7,
    y: 1.02,
    z: 2.45,
    rotY: Math.atan2(portal.x - 1.7, portal.z - 2.45) + 1.05,
  };

  const add = (list: Matrix4[], x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    list.push(place(x, y, z, sx, sy, sz));
  };

  for (let x = -7; x <= 7; x += step) {
    for (let z = 6; z >= -2; z -= step) {
      const brokenEdge = (Math.abs(x) > 5 || z > 5) && ((x * 3 + z) & 3) === 0;
      if (brokenEdge) continue;
      add(ground, x, -0.5, z, step, 1, step);
      if (quality === "high" && ((x + z * 2) & 7) === 0) add(stone, x, 0.5, z, 1, 1, 1);
    }
  }

  for (let x = 1; x <= 2; x += step) {
    for (let z = 2; z <= 4; z += step) add(stone, x, 0.5, z, step, 1, step);
  }

  const peaks: Array<[number, number, number]> = quality === "high"
    ? [[-8, 4, 2], [-7, 5, -1], [-9, 3, -3], [8, 5, 1], [7, 4, -2], [9, 3, -5], [-8, 4, -8], [8, 5, -10]]
    : [[-8, 4, 1], [8, 4, 0], [-7, 3, -6], [7, 3, -8]];
  for (const [x, height, z] of peaks) {
    for (let level = 0; level < height; level += step) {
      const width = 1 + Math.floor((height - level) / 2);
      add(stone, x, level + step * 0.5, z, width, step, width);
    }
  }

  add(stone, portal.x - 1.55, 1.6, portal.z, 0.55, 3.2, 0.55);
  add(stone, portal.x + 1.55, 1.6, portal.z, 0.55, 3.2, 0.55);
  add(stone, portal.x, 3.4, portal.z, 3.65, 0.42, 0.55);
  add(stone, portal.x - 3.3, 1.05, portal.z + 0.5, 1.5, 2.1, 1.1);
  add(stone, portal.x + 3.5, 0.75, portal.z - 0.3, 1.3, 1.5, 1.15);
  add(accent, portal.x - 1.55, 3.05, portal.z + 0.28, 0.12, 0.12, 0.12);
  add(accent, portal.x + 1.55, 3.05, portal.z + 0.28, 0.12, 0.12, 0.12);

  add(stone, 3.45, 0.7, 3.15, 1.15, 1.4, 0.85);
  add(accent, 3.45, 1.05, 2.68, 0.72, 0.42, 0.08);
  add(stone, -3.15, 0.45, 3.35, 0.7, 0.9, 0.7);
  add(accent, -3.15, 1.35, 3.35, 0.1, 0.85, 0.1);

  add(accent, 0.15, 0.08, 3.5, 0.08, 0.08, 4.4);
  add(accent, 1.35, 0.12, 2.15, 2.4, 0.06, 0.06);
  add(accent, -1.6, 0.55, 0.2, 0.06, 0.06, 3.2);

  const ruinZ = quality === "high" ? [-4, -6.5, -9, -11.5] : [-5, -9];
  ruinZ.forEach((z, index) => {
    add(stone, -3.4, 1.15, z, 1.15, 2.3, 1);
    add(stone, 3.15, 1.55, z - 0.4, 1, 3.1, 1);
    if (index % 2 === 0) add(stone, 0.35, 0.45, z, 1.7, 0.45, 0.8);
    add(accent, -3.4, 2.45, z, 0.16, 0.16, 0.16);
    add(accent, 3.15, 3.2, z - 0.4, 0.14, 0.14, 0.14);
  });

  for (let x = -2; x <= 2; x += step) add(stone, x, 0.15, -10.2, step, 0.28, 1.3);

  const corridorEnd = quality === "high" ? -21 : -18;
  for (let z = -13; z >= corridorEnd; z -= step) {
    add(stone, -2.7, 1.25, z, 0.85, 2.5, step);
    add(stone, 2.7, 1.25, z, 0.85, 2.5, step);
    add(ground, 0, -0.5, z, 4.2, 1, step);
    if (quality === "high" && z % 4 === 0) add(accent, -2.15, 0.35, z, 0.1, 0.1, 0.1);
  }
  add(accent, -1.15, 0.22, -16, 0.07, 0.07, 14);
  add(accent, 1.2, 1.35, -17, 0.06, 0.06, 12);

  const arenaEnd = quality === "high" ? -34 : -30;
  for (let x = -5; x <= 5; x += step) {
    for (let z = -25; z >= arenaEnd; z -= step) add(ground, x, -0.5, z, step, 1, step);
  }
  add(stone, -4.6, 2, -28, 1.25, 4, 1.25);
  add(stone, 4.5, 2.2, -31, 1.25, 4.4, 1.25);
  add(stone, 0.2, 0.55, -29.5, 1.4, 1.1, 1);
  add(accent, 0.2, 1.15, -28.95, 0.8, 0.36, 0.08);
  add(accent, -4.6, 4.15, -28, 0.18, 0.18, 0.18);
  add(accent, 4.5, 4.55, -31, 0.18, 0.18, 0.18);
  add(accent, -2.1, 1.7, -27.2, 0.08, 1.5, 0.08);
  add(accent, 2.3, 1.7, -32.2, 0.08, 1.5, 0.08);

  const vaultZ = quality === "high" ? -40 : -34;
  add(ground, 0, -0.5, vaultZ + 2, 7, 1, 5);
  add(stone, -1.9, 1.8, vaultZ, 0.6, 3.6, 0.6);
  add(stone, 1.9, 1.8, vaultZ, 0.6, 3.6, 0.6);
  add(stone, 0, 3.75, vaultZ, 4.4, 0.48, 0.6);
  add(stone, -4.2, 1.4, vaultZ + 1.5, 1.2, 2.8, 1.2);
  add(stone, 4.2, 1.6, vaultZ + 1.2, 1.2, 3.2, 1.2);
  add(accent, 0, 2.2, vaultZ + 0.35, 0.16, 1.4, 0.08);
  add(accent, -4.2, 2.95, vaultZ + 1.5, 0.16, 0.16, 0.16);
  add(accent, 4.2, 3.35, vaultZ + 1.2, 0.16, 0.16, 0.16);

  return {
    ground,
    stone,
    accent,
    portal,
    operative,
    gateZ: -16.2,
    routes: [
      [[1.15, 0.25, 5.4], [0.1, 0.4, 1.2], [-0.15, 1.15, -4], [0.2, 0.7, -16], [0.4, 1.1, -29]],
      [[-2.8, 1.1, 3.2], [portal.x, 2.15, portal.z], [0.6, 1.5, -9], [1.1, 1.7, -28], [0, 2.1, vaultZ + 1]],
    ],
  };
}
