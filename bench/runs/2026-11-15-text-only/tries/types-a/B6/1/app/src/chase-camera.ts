import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };
const EPS = 1e-9;
// Below this sine of the angle between up and the line of sight, up is treated as parallel.
const PARALLEL_EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function len(a: Vec): number {
  return Math.hypot(a.x, a.y, a.z);
}

function unit(a: Vec): Vec | undefined {
  const n = len(a);
  return n > EPS ? { x: a.x / n, y: a.y / n, z: a.z / n } : undefined;
}

/**
 * Unit vector perpendicular to the line of sight `f` that lies in the plane
 * spanned by `up` and `f`: the on-screen up that best matches `up` while the
 * camera keeps looking along `f`. Undefined when `up` is (nearly) parallel to
 * `f`, since the roll is then undefined.
 */
function rolledUp(up: Vec, f: Vec): Vec | undefined {
  const d = up.x * f.x + up.y * f.y + up.z * f.z;
  const p = { x: up.x - d * f.x, y: up.y - d * f.y, z: up.z - d * f.z };
  const n = len(p);
  if (!(n > PARALLEL_EPS)) return undefined; // also rejects NaN
  return { x: p.x / n, y: p.y / n, z: p.z / n };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  // Start upright. If the view is vertical, world Y gives no roll, so fall back to Z.
  const f0 = unit(sub(target, eye));
  const start = (f0 && (rolledUp(WORLD_UP, f0) ?? rolledUp(WORLD_Z, f0))) ?? WORLD_UP;

  const camera = createBankedFreeCamera(eye, target, start);

  return {
    camera,
    bank(up: Vec): void {
      const f = unit(sub(camera.target, camera.position));
      if (!f) return;
      const r = rolledUp(up, f);
      // Up is along the line of sight: keep the previous roll and the existing upVector.
      if (!r) return;
      camera.upVector.x = r.x;
      camera.upVector.y = r.y;
      camera.upVector.z = r.z;
    },
  };
}
