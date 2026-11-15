import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length the up vector's component across the line of sight is
// treated as zero (up is effectively parallel to the view direction), and the
// camera keeps its previous roll.
const DEGENERATE_EPSILON = 1e-12;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
  );

  // The eye and target are fixed, so the line of sight is fixed too.
  let fx = target.x - eye.x;
  let fy = target.y - eye.y;
  let fz = target.z - eye.z;
  const fl = Math.hypot(fx, fy, fz);
  if (!(fl > 0)) {
    throw new Error("createChaseCamera: eye and target must differ");
  }
  fx /= fl;
  fy /= fl;
  fz /= fl;

  function bank(up: Vec): void {
    // Project up onto the image plane: w = up - (up . f) f.
    const d = up.x * fx + up.y * fy + up.z * fz;
    const wx = up.x - d * fx;
    const wy = up.y - d * fy;
    const wz = up.z - d * fz;
    const wl = Math.hypot(wx, wy, wz);

    // Up is along the line of sight (either direction), or the input is NaN:
    // there is no roll that matches it, so keep the previous roll.
    if (!(wl > DEGENERATE_EPSILON)) return;

    const u = camera.upVector;
    u.x = wx / wl;
    u.y = wy / wl;
    u.z = wz / wl;
  }

  return { camera, bank };
}
