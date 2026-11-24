import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const ZERO_EPS = 1e-12;
const PARALLEL_EPS = 1e-12;

function isFiniteVec(v: Vec): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function length(v: Vec): number {
  return Math.hypot(v.x, v.y, v.z);
}

function normalize(v: Vec): Vec | null {
  if (!isFiniteVec(v)) return null;
  const l = length(v);
  if (!Number.isFinite(l) || l <= ZERO_EPS) return null;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function closestOrthogonalUp(up: Vec, forward: Vec): Vec | null {
  if (!isFiniteVec(up) || !isFiniteVec(forward)) return null;

  const d = dot(up, forward);
  const out = {
    x: up.x - forward.x * d,
    y: up.y - forward.y * d,
    z: up.z - forward.z * d,
  };

  const l = length(out);
  if (!Number.isFinite(l) || l <= PARALLEL_EPS) return null;

  return { x: out.x / l, y: out.y / l, z: out.z / l };
}

function initialUp(eye: Vec, target: Vec): Vec {
  const forward = normalize({
    x: target.x - eye.x,
    y: target.y - eye.y,
    z: target.z - eye.z,
  });

  if (forward) {
    const upright = closestOrthogonalUp({ x: 0, y: 1, z: 0 }, forward);
    if (upright) return upright;

    const fallbackX = closestOrthogonalUp({ x: 1, y: 0, z: 0 }, forward);
    if (fallbackX) return fallbackX;

    const fallbackZ = closestOrthogonalUp({ x: 0, y: 0, z: 1 }, forward);
    if (fallbackZ) return fallbackZ;
  }

  return { x: 0, y: 1, z: 0 };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    initialUp(eye, target),
  );

  return {
    camera,
    bank(up: Vec): void {
      const forward = normalize({
        x: camera.target.x - camera.position.x,
        y: camera.target.y - camera.position.y,
        z: camera.target.z - camera.position.z,
      });
      if (!forward) return;

      const unitUp = normalize(up);
      if (!unitUp) return;

      const newUp = closestOrthogonalUp(unitUp, forward);
      if (!newUp) return;

      const uv = camera.upVector;
      uv.x = newUp.x;
      uv.y = newUp.y;
      uv.z = newUp.z;
    },
  };
}
