import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

export type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

  const asVec = (v: unknown): Vec => v as Vec;
  const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y + a.z * b.z;
  const length = (a: Vec): number => Math.sqrt(dot(a, a));

  const setVec = (v: unknown, x: number, y: number, z: number): void => {
    const vec = v as {
      x?: number;
      y?: number;
      z?: number;
      copyFrom?: (other: Vec) => void;
    };

    if (typeof vec.copyFrom === "function") {
      vec.copyFrom({ x, y, z });
    } else {
      vec.x = x;
      vec.y = y;
      vec.z = z;
    }
  };

  const bank = (up: Vec): void => {
    const pos = asVec(camera.position);
    const tgt = asVec(camera.target);

    const forward: Vec = {
      x: tgt.x - pos.x,
      y: tgt.y - pos.y,
      z: tgt.z - pos.z,
    };

    const forwardLen = length(forward);
    if (!Number.isFinite(forwardLen) || forwardLen < EPS) {
      return;
    }

    forward.x /= forwardLen;
    forward.y /= forwardLen;
    forward.z /= forwardLen;

    const upLen = length(up);
    if (!Number.isFinite(upLen) || upLen < EPS) {
      return;
    }

    const u: Vec = {
      x: up.x / upLen,
      y: up.y / upLen,
      z: up.z / upLen,
    };

    const along = dot(u, forward);
    const perpendicular: Vec = {
      x: u.x - forward.x * along,
      y: u.y - forward.y * along,
      z: u.z - forward.z * along,
    };

    const perpendicularLen = length(perpendicular);
    if (!Number.isFinite(perpendicularLen) || perpendicularLen < EPS) {
      return;
    }

    setVec(
      camera.upVector,
      perpendicular.x / perpendicularLen,
      perpendicular.y / perpendicularLen,
      perpendicular.z / perpendicularLen,
    );
  };

  return { camera, bank };
}
