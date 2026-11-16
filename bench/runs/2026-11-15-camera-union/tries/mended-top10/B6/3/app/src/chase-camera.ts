import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the wanted up direction is (numerically) along the line of sight,
// so there is no roll that can match it and the previous roll is kept.
const DEGENERATE_EPSILON = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  // Starts upright: camera up = world +Y.
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  function bank(up: Vec): void {
    const pos = camera.position;
    const tgt = camera.target;

    // Unit line of sight, from the camera towards the target.
    const fx = tgt.x - pos.x;
    const fy = tgt.y - pos.y;
    const fz = tgt.z - pos.z;
    const fLen = Math.hypot(fx, fy, fz);
    if (fLen === 0) return;
    const forward = { x: fx / fLen, y: fy / fLen, z: fz / fLen };

    // Normalise the requested up defensively; a zero vector gives no direction at all.
    const uLen = Math.hypot(up.x, up.y, up.z);
    if (uLen === 0) return;
    const ux = up.x / uLen, uy = up.y / uLen, uz = up.z / uLen;

    // Remove the component along the line of sight: what is left is the closest
    // direction to the wanted up that the camera can show on screen.
    const d = ux * forward.x + uy * forward.y + uz * forward.z;
    const rx = ux - d * forward.x;
    const ry = uy - d * forward.y;
    const rz = uz - d * forward.z;
    const rLen = Math.hypot(rx, ry, rz);

    // Exactly (or numerically) along the line of sight: keep the previous roll.
    if (rLen < DEGENERATE_EPSILON) return;

    const screenUp = camera.upVector;
    screenUp.x = rx / rLen;
    screenUp.y = ry / rLen;
    screenUp.z = rz / rLen;
  }

  return { camera, bank };
}
