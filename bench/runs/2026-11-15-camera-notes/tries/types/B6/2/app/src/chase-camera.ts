import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

/**
 * Below this length, the component of `up` perpendicular to the line of sight
 * is treated as zero (up is effectively parallel to the view direction).
 */
const DEGENERATE_EPSILON = 1e-6;

/**
 * A chase camera at `eye` looking at `target`, starting upright (world +Y).
 * `bank(up)` rolls it so that its picture's up matches `up` as closely as
 * possible while still looking at `target`.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  // The eye and target are fixed, so the line of sight is fixed too.
  const fx = target.x - eye.x;
  const fy = target.y - eye.y;
  const fz = target.z - eye.z;
  const fLen = Math.hypot(fx, fy, fz);
  const forward = fLen > 0
    ? { x: fx / fLen, y: fy / fLen, z: fz / fLen }
    : { x: 0, y: 0, z: 1 };

  function bank(up: Vec): void {
    const uLen = Math.hypot(up.x, up.y, up.z);
    if (uLen === 0 || !Number.isFinite(uLen)) {
      return; // no usable up direction: keep the previous roll
    }
    const ux = up.x / uLen;
    const uy = up.y / uLen;
    const uz = up.z / uLen;

    // Remove the component of up along the line of sight; what remains is the
    // closest direction to `up` that is perpendicular to the view direction.
    const d = ux * forward.x + uy * forward.y + uz * forward.z;
    const px = ux - d * forward.x;
    const py = uy - d * forward.y;
    const pz = uz - d * forward.z;
    const pLen = Math.hypot(px, py, pz);

    if (pLen < DEGENERATE_EPSILON) {
      // Up points along the line of sight (either way): there is no roll to
      // pick. Leave the up vector untouched so the camera keeps its last roll
      // instead of falling back to the identity rotation.
      return;
    }

    const upVector = camera.upVector;
    upVector.x = px / pLen;
    upVector.y = py / pLen;
    upVector.z = pz / pLen;
  }

  return { camera, bank };
}
