import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const banked = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

  function bank(up: Vec): void {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (len < 1e-8) return;

    const ndx = dx / len;
    const ndy = dy / len;
    const ndz = dz / len;

    // If the car's up is (anti-)parallel to the line of sight,
    // the look-at basis would be degenerate; keep previous roll.
    const dot = up.x * ndx + up.y * ndy + up.z * ndz;
    if (Math.abs(dot) > 0.9999) return;

    banked.upVector.x = up.x;
    banked.upVector.y = up.y;
    banked.upVector.z = up.z;
  }

  return { camera: banked, bank };
}
