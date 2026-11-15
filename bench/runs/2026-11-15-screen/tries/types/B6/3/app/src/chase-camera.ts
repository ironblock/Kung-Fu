import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

/**
 * Below this length, the component of `up` perpendicular to the line of sight
 * is too small to define a roll direction (sine of the up/sight angle). In that
 * case the roll is left unchanged.
 */
const DEGENERATE_EPSILON = 1e-4;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  // Unit line of sight, fixed because the eye and target do not move.
  const fx0 = target.x - eye.x;
  const fy0 = target.y - eye.y;
  const fz0 = target.z - eye.z;
  const fLen = Math.hypot(fx0, fy0, fz0);
  if (!(fLen > 0)) {
    throw new Error("createChaseCamera: eye and target must be distinct");
  }
  const fx = fx0 / fLen;
  const fy = fy0 / fLen;
  const fz = fz0 / fLen;

  // Starts upright: world +Y as the initial up.
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );
  const upVector = camera.upVector;

  return {
    camera,
    bank(up: Vec): void {
      const uLen = Math.hypot(up.x, up.y, up.z);
      if (!(uLen > 0) || !Number.isFinite(uLen)) {
        return; // no usable direction: keep the previous roll
      }
      const ux = up.x / uLen;
      const uy = up.y / uLen;
      const uz = up.z / uLen;

      // Remove the component along the line of sight. What remains is the
      // closest achievable picture-up direction.
      const d = ux * fx + uy * fy + uz * fz;
      const px = ux - d * fx;
      const py = uy - d * fy;
      const pz = uz - d * fz;
      const pLen = Math.hypot(px, py, pz);
      if (pLen < DEGENERATE_EPSILON) {
        return; // up is (nearly) along the line of sight: keep the previous roll
      }

      upVector.x = px / pLen;
      upVector.y = py / pLen;
      upVector.z = pz / pLen;
    },
  };
}
