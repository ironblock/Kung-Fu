import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the component of `up` perpendicular to the line of sight
// is treated as zero (up is parallel to the view direction) and the roll is kept.
const DEGENERATE_EPSILON = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  // Starts upright: world +Y is the initial up vector.
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  // Unit line of sight from eye to target. Target is fixed for the camera's life.
  const fx0 = target.x - eye.x;
  const fy0 = target.y - eye.y;
  const fz0 = target.z - eye.z;
  const fLen = Math.hypot(fx0, fy0, fz0);
  const fx = fx0 / fLen;
  const fy = fy0 / fLen;
  const fz = fz0 / fLen;
  const viewValid = fLen > 0 && Number.isFinite(fLen);

  function bank(up: Vec): void {
    if (!viewValid) return;

    // Remove the component of up along the line of sight. What remains is the
    // direction "up" should have in the picture, as close as it can get.
    const d = up.x * fx + up.y * fy + up.z * fz;
    const px = up.x - d * fx;
    const py = up.y - d * fy;
    const pz = up.z - d * fz;
    const pLen = Math.hypot(px, py, pz);

    // up is (numerically) along the line of sight: no defined roll, keep the previous one.
    if (!(pLen > DEGENERATE_EPSILON) || !Number.isFinite(pLen)) return;

    // Writing a unit vector perpendicular to the view direction keeps the look-at
    // basis well-conditioned, and the target stays the same.
    const up2 = camera.upVector;
    up2.x = px / pLen;
    up2.y = py / pLen;
    up2.z = pz / pLen;
  }

  return { camera, bank };
}
