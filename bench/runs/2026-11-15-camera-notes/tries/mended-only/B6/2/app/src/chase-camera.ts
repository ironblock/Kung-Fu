import type { FreeCamera } from "@babylonjs/lite";
// ASSUMPTION: createBankedFreeCamera is the only Babylon Lite 1.39.0 constructor with an
// upVector (camera-notes.md, item 29). Its exact signature is unverified (the library is not
// on this machine); the call below is a best guess and must be checked against the real API.
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the component of "up" perpendicular to the line of sight is treated as zero.
const EPS = 1e-9;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y + a.z * b.z;
const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s, z: a.z * s });
const len = (a: Vec): number => Math.sqrt(dot(a, a));

function normalize(a: Vec): Vec {
  const l = len(a);
  if (!(l > 0)) throw new RangeError("zero-length vector");
  return scale(a, 1 / l);
}

// Returns the unit vector closest to `v` that is perpendicular to unit `f`,
// or null if `v` is (numerically) parallel to `f`.
function perpendicularUp(v: Vec, f: Vec): Vec | null {
  const p = sub(v, scale(f, dot(v, f)));
  const l = len(p);
  return l > EPS ? scale(p, 1 / l) : null;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const forward = normalize(sub(target, eye));
  // Start upright: world +Y, or +Z if the view is vertical.
  let roll = perpendicularUp(WORLD_UP, forward) ?? perpendicularUp(WORLD_Z, forward)!;

  // Unverified call; see the import comment above.
  const camera = createBankedFreeCamera(eye, target);
  camera.position = { x: eye.x, y: eye.y, z: eye.z };
  camera.target = { x: target.x, y: target.y, z: target.z };
  camera.upVector = { x: roll.x, y: roll.y, z: roll.z };

  return {
    camera,
    bank(up: Vec): void {
      const f = normalize(sub(camera.target, camera.position));
      // Prefer the car's up. If it lies along the line of sight, keep the previous roll.
      // If the previous roll is also unusable, leave the camera's up untouched.
      const next = perpendicularUp(normalize(up), f) ?? perpendicularUp(roll, f);
      if (next) {
        roll = next;
        camera.upVector = { x: next.x, y: next.y, z: next.z };
      }
    },
  };
}
