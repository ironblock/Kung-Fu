import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  // Pre-compute the unit view direction (eye → target).
  let fx = target.x - eye.x;
  let fy = target.y - eye.y;
  let fz = target.z - eye.z;
  const len = Math.sqrt(fx * fx + fy * fy + fz * fz);
  if (len > 0) {
    fx /= len;
    fy /= len;
    fz /= len;
  } else {
    // Degenerate: eye and target coincide; Babylon defaults to +Z.
    fx = 0;
    fy = 0;
    fz = 1;
  }

  function bank(up: Vec): void {
    // Project the car's up onto the plane perpendicular to the view direction.
    const dot = up.x * fx + up.y * fy + up.z * fz;
    const px = up.x - dot * fx;
    const py = up.y - dot * fy;
    const pz = up.z - dot * fz;
    const pLen = Math.sqrt(px * px + py * py + pz * pz);

    // If the car's up is (anti-)parallel to the line of sight,
    // the projection vanishes and we keep the previous roll.
    if (pLen < 1e-6) return;

    const inv = 1 / pLen;
    const uv = camera.upVector;
    uv.x = px * inv;
    uv.y = py * inv;
    uv.z = pz * inv;
  }

  return { camera, bank };
}
