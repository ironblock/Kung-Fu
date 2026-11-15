import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the car's up is (numerically) along the line of sight.
const DEGENERATE_EPSILON = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  const bank = (up: Vec): void => {
    // Use the camera's live position and target, not the original eye/target.
    const p = camera.position;
    const t = camera.target;
    let fx = t.x - p.x;
    let fy = t.y - p.y;
    let fz = t.z - p.z;
    const fLen = Math.hypot(fx, fy, fz);
    if (!(fLen > 0)) return; // no line of sight; keep previous roll
    fx /= fLen; fy /= fLen; fz /= fLen;

    const upLen = Math.hypot(up.x, up.y, up.z);
    if (!(upLen > 0)) return; // invalid up; keep previous roll
    const ux = up.x / upLen;
    const uy = up.y / upLen;
    const uz = up.z / upLen;

    // Project the car's up onto the plane perpendicular to the line of sight.
    // That is the closest the camera's up can get to it while looking at the target.
    const d = ux * fx + uy * fy + uz * fz;
    const rx = ux - d * fx;
    const ry = uy - d * fy;
    const rz = uz - d * fz;
    const rLen = Math.hypot(rx, ry, rz);

    // Up is (almost) parallel to the line of sight: the roll is undefined, keep it.
    if (!(rLen > DEGENERATE_EPSILON)) return;

    camera.upVector.x = rx / rLen;
    camera.upVector.y = ry / rLen;
    camera.upVector.z = rz / rLen;
  };

  return { camera, bank };
}
