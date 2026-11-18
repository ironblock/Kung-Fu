import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

  function bank(up: Vec): void {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-8) return;

    const fx = dx / len;
    const fy = dy / len;
    const fz = dz / len;

    // Project the car's up onto the plane perpendicular to the line of sight.
    const dot = up.x * fx + up.y * fy + up.z * fz;
    const px = up.x - dot * fx;
    const py = up.y - dot * fy;
    const pz = up.z - dot * fz;
    const perpLen = Math.sqrt(px * px + py * py + pz * pz);

    // If the car's up is (anti-)parallel to the line of sight there is no
    // meaningful roll; keep the previous upVector as-is.
    if (perpLen < 1e-6) return;

    // Writing the car's up onto the camera's upVector makes the camera's
    // in-picture up match the perpendicular component of that vector, which
    // is the closest alignment possible while still looking at the target.
    const uv = camera.upVector;
    uv.x = up.x;
    uv.y = up.y;
    uv.z = up.z;
  }

  return { camera, bank };
}
