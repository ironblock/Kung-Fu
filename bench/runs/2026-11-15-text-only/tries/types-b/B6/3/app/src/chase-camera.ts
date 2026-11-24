import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

/**
 * Squared length of the up direction after removing its component along the
 * line of sight. Below this the up vector is (numerically) parallel to the
 * view direction and no roll is defined, so the previous roll is kept.
 */
const DEGENERATE_EPS_SQ = 1e-12;

function normalizeOrNull(v: Vec): Vec | null {
  const len2 = v.x * v.x + v.y * v.y + v.z * v.z;
  if (!(len2 > 0) || !Number.isFinite(len2)) return null;
  const inv = 1 / Math.sqrt(len2);
  return { x: v.x * inv, y: v.y * inv, z: v.z * inv };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const forward = normalizeOrNull({
    x: target.x - eye.x,
    y: target.y - eye.y,
    z: target.z - eye.z,
  });

  // Starts upright: world +Y as the initial up vector.
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: 0, y: 1, z: 0 },
  );

  const bank = (up: Vec): void => {
    if (!forward) return;
    const u = normalizeOrNull(up);
    if (!u) return;

    // Remove the component of `up` along the line of sight; what remains is
    // the closest up direction the camera can take while still looking at target.
    const d = u.x * forward.x + u.y * forward.y + u.z * forward.z;
    const wx = u.x - d * forward.x;
    const wy = u.y - d * forward.y;
    const wz = u.z - d * forward.z;
    const w2 = wx * wx + wy * wy + wz * wz;
    if (!(w2 >= DEGENERATE_EPS_SQ)) return; // parallel to the view: keep previous roll

    const inv = 1 / Math.sqrt(w2);
    const axis = camera.upVector;
    axis.x = wx * inv;
    axis.y = wy * inv;
    axis.z = wz * inv;
  };

  return { camera, bank };
}
