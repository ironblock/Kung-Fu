import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

  const bank = (up: Vec): void => {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len === 0) return;

    const nx = dx / len;
    const ny = dy / len;
    const nz = dz / len;

    const dot = up.x * nx + up.y * ny + up.z * nz;
    if (Math.abs(dot) > 1 - 1e-6) return;

    camera.upVector.x = up.x;
    camera.upVector.y = up.y;
    camera.upVector.z = up.z;
  };

  return { camera, bank };
}
