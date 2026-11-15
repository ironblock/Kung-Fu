import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

// If the requested up is within this relative distance of the line of sight,
// it is treated as parallel to it and the previous roll is kept.
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );
  const upVector = camera.upVector;

  return {
    camera,
    bank(up: Vec): void {
      // Unit line of sight from the camera toward its target.
      const fx = camera.target.x - camera.position.x;
      const fy = camera.target.y - camera.position.y;
      const fz = camera.target.z - camera.position.z;
      const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);
      if (!(fLen > 0)) return;
      const ux = fx / fLen;
      const uy = fy / fLen;
      const uz = fz / fLen;

      // Remove the component of `up` along the line of sight. What remains is
      // the closest direction to `up` that is perpendicular to the view, which
      // is the roll that matches `up` as closely as possible.
      const upLen = Math.sqrt(up.x * up.x + up.y * up.y + up.z * up.z);
      const d = up.x * ux + up.y * uy + up.z * uz;
      const px = up.x - d * ux;
      const py = up.y - d * uy;
      const pz = up.z - d * uz;
      const pLen = Math.sqrt(px * px + py * py + pz * pz);

      // `up` (nearly) along the line of sight, or zero: no defined roll.
      // Keep the previous up vector so the roll does not change.
      if (!(pLen > PARALLEL_EPSILON * upLen)) return;

      upVector.x = px / pLen;
      upVector.y = py / pLen;
      upVector.z = pz / pLen;
    },
  };
}
