import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(eye, target);

  const bank = (up: Vec): void => {
    const pos = camera.position;
    const tgt = camera.target;

    const dx = tgt.x - pos.x;
    const dy = tgt.y - pos.y;
    const dz = tgt.z - pos.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (len < 1e-8) return;

    const fx = dx / len;
    const fy = dy / len;
    const fz = dz / len;

    // Project the car's up onto the plane perpendicular to the look direction.
    const dot = up.x * fx + up.y * fy + up.z * fz;
    const px = up.x - dot * fx;
    const py = up.y - dot * fy;
    const pz = up.z - dot * fz;

    const pLen = Math.sqrt(px * px + py * py + pz * pz);

    // If the car's up is (anti-)parallel to the line of sight the projection
    // vanishes; keep the previous roll in that case.
    if (pLen < 1e-6) return;

    const inv = 1 / pLen;
    camera.upVector.x = px * inv;
    camera.upVector.y = py * inv;
    camera.upVector.z = pz * inv;
  };

  return { camera, bank };
}
