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

const OX = 2.15;

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
  const portal: PortalSpec = { x: OX, y: 2.05, z: -0.2, width: 1.35, height: 3.4 };
  const operative: OperativeSpec = { x: OX + 0.55, y: 0, z: 2.35, rotY: Math.PI + 0.18 };

  const add = (list: Matrix4[], x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    list.push(place(x, y, z, sx, sy, sz));
  };

  const tower = (x: number, z: number, height: number, width: number) => {
    for (let level = 0; level < height; level += step) {
      const shrink = level > height - step * 2 ? width * 0.72 : width;
      add(stone, x, level + step * 0.5, z, shrink, step, shrink);
      if (level % (step * 2) === 0) add(accent, x, level + step * 0.15, z + width * 0.42, 0.08, 0.08, 0.05);
    }
    add(accent, x, height + 0.08, z, 0.16, 0.1, 0.16);
  };

  for (let x = OX - 8; x <= OX + 6; x += step) {
    for (let z = 5; z >= -9; z -= step) {
      const lane = Math.abs(x - OX) < 1.15 && z < 3.4 && z > -0.8;
      if (lane) continue;
      add(ground, x, -0.5, z, step, 1, step);
    }
  }

  const flank = quality === "high"
    ? [
        [OX - 3.6, 1.5, 4],
        [OX - 5.4, -2.4, 5],
        [OX - 2.8, -6.2, 3],
        [OX + 2.7, 1.2, 6],
        [OX + 4.5, -1.5, 5],
        [OX + 1.8, -5.6, 4],
      ]
    : [
        [OX - 4.2, 1.2, 4],
        [OX - 3.2, -5.4, 3],
        [OX + 3.2, 0.8, 5],
        [OX + 2.2, -5.2, 3],
      ];
  flank.forEach(([x, z, height]) => tower(x, z, height, 1.15));

  add(stone, OX - 2.5, 0.42, -2.1, 1.15, 0.84, 1.05);
  add(stone, OX + 2.4, 0.62, -2.5, 1.25, 1.24, 1.05);
  add(stone, OX - 3.1, 0.32, 2.5, 0.9, 0.64, 0.9);
  add(stone, OX + 3.05, 0.38, 2.2, 0.95, 0.76, 0.85);
  add(accent, OX + 2.4, 1.32, -2.5, 0.18, 0.08, 0.08);

  const avenueEnd = quality === "high" ? -26 : -18;
  for (let z = -10; z >= avenueEnd; z -= step) {
    add(stone, OX - 3.2, 1.2, z, 1.05, 2.4, step);
    add(stone, OX + 3.3, 1.45, z, 1.12, 2.9, step);
    add(ground, OX, -0.5, z, 4.4, 1, step);
    if (z % (step * 4) === 0) add(accent, OX, 0.08, z, 0.12, 0.06, 0.12);
  }

  const cube: [number, number, number] = [OX, 3.62, -0.2];
  const gate: [number, number, number] = [OX, 1.7, -0.2];
  const chest: [number, number, number] = [operative.x - 0.05, 1.2, operative.z - 0.35];

  return {
    ground,
    stone,
    accent,
    portal,
    operative,
    gateZ: -16,
    routes: [
      [cube, gate],
      [gate, chest],
      [[OX + 2.9, 2.3, -1.6], [OX + 0.55, 2.15, -0.2]],
    ],
  };
}
