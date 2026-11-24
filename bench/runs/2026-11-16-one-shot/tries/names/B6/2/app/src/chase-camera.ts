import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the up vector is treated as parallel to the line of sight.
const DEGENERATE_EPS = 1e-9;

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Unit vector perpendicular to forward (unit) that is closest to u.
// Returns null when u is (numerically) parallel to forward.
function orthoUp(u: Vec, forward: Vec): Vec | null {
  const d = dot(u, forward);
  const w = {
    x: u.x - d * forward.x,
    y: u.y - d * forward.y,
    z: u.z - d * forward.z,
  };
  const l = Math.sqrt(dot(w, w));
  if (!(l > DEGENERATE_EPS)) return null; // also rejects NaN
  return { x: w.x / l, y: w.y / l, z: w.z / l };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const fx = target.x - eye.x;
  const fy = target.y - eye.y;
  const fz = target.z - eye.z;
  const fl = Math.sqrt(fx * fx + fy * fy + fz * fz);
  if (!(fl > 0) || !Number.isFinite(fl)) {
    throw new Error("createChaseCamera: eye and target must be distinct, finite points");
  }
  // Line of sight is fixed for the life of the camera (it always looks at target).
  const forward: Vec = { x: fx / fl, y: fy / fl, z: fz / fl };

  // "Upright" = world up as close as possible to perpendicular to the line of sight.
  // If the line of sight is vertical, fall back to world Z.
  const upright =
    orthoUp({ x: 0, y: 1, z: 0 }, forward) ??
    orthoUp({ x: 0, y: 0, z: 1 }, forward)!;

  // Pass copies so later mutation of the caller's objects cannot alias the camera.
  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: upright.x, y: upright.y, z: upright.z },
  );

  let lastUp: Vec = upright;

  return {
    camera,
    bank(up: Vec): void {
      const next = orthoUp(up, forward);
      // On degenerate input, keep the previous roll.
      if (next) lastUp = next;
      const cur = camera.upVector;
      cur.x = lastUp.x;
      cur.y = lastUp.y;
      cur.z = lastUp.z;
    },
  };
}
