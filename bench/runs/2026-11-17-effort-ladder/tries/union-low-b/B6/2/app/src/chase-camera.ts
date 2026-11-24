import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const cam = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

  function bank(up: Vec): void {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len === 0) return;

    const lx = dx / len;
    const ly = dy / len;
    const lz = dz / len;

    const dot = up.x * lx + up.y * ly + up.z * lz;
    if (Math.abs(dot) > 1 - 1e-6) return;

    cam.upVector.x = up.x;
    cam.upVector.y = up.y;
    cam.upVector.z = up.z;
  }

  return { camera: cam, bank };
}
