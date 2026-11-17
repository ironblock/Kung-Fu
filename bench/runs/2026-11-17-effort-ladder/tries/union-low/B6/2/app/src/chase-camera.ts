import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, BankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const cam = createBankedFreeCamera(eye, target);
  const banked = cam as BankedFreeCamera;

  const bank = (up: Vec): void => {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len === 0) return;

    const vx = dx / len;
    const vy = dy / len;
    const vz = dz / len;

    const dot = up.x * vx + up.y * vy + up.z * vz;

    // Perpendicular component of up relative to the view direction.
    // If its magnitude is near zero, up is (anti)parallel to the line of sight
    // and no meaningful roll can be defined — keep the previous roll.
    const px = up.x - dot * vx;
    const py = up.y - dot * vy;
    const pz = up.z - dot * vz;
    const perpLen = Math.sqrt(px * px + py * py + pz * pz);

    if (perpLen < 1e-4) return;

    banked.upVector.x = up.x;
    banked.upVector.y = up.y;
    banked.upVector.z = up.z;
  };

  return { camera: cam, bank };
}
