import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Relative threshold on the length of the up vector's component perpendicular
// to the line of sight. Below this, the up vector is treated as parallel to the
// view direction, so there is no roll to aim for and the previous roll is kept.
const PARALLEL_EPSILON = 1e-9;

/**
 * A free camera at `eye` looking at `target` whose roll can be driven by the
 * vehicle's up direction. Starts upright (world +Y).
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  function bank(up: Vec): void {
    // Current unit line of sight, eye -> target.
    const fx = camera.target.x - camera.position.x;
    const fy = camera.target.y - camera.position.y;
    const fz = camera.target.z - camera.position.z;
    const fLen = Math.hypot(fx, fy, fz);
    const upLen = Math.hypot(up.x, up.y, up.z);
    if (fLen === 0 || upLen === 0) return; // nothing to aim with: keep previous roll
    const dx = fx / fLen;
    const dy = fy / fLen;
    const dz = fz / fLen;

    // Unit up minus its component along the line of sight: the closest
    // direction to `up` that is perpendicular to the view direction. This is
    // the roll that puts the car's up as close to the picture's up as possible.
    const ux = up.x / upLen;
    const uy = up.y / upLen;
    const uz = up.z / upLen;
    const along = ux * dx + uy * dy + uz * dz;
    const px = ux - along * dx;
    const py = uy - along * dy;
    const pz = uz - along * dz;
    const pLen = Math.hypot(px, py, pz);

    // Up is (numerically) along the line of sight. Writing a degenerate up would
    // make the engine fall back to an identity roll, so skip the write and keep
    // the previous up vector, and therefore the previous roll.
    if (!(pLen > PARALLEL_EPSILON)) return;

    camera.upVector.x = px / pLen;
    camera.upVector.y = py / pLen;
    camera.upVector.z = pz / pLen;
  }

  return { camera, bank };
}
