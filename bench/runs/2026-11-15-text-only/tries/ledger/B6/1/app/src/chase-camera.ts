import type { FreeCamera } from "@babylonjs/lite";
// ASSUMPTION, NOT VERIFIED: the factory name and its signature. The library is not
// available on this machine, so adjust this import and the call below to the real API.
import { createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const EPS = 1e-6;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y + a.z * b.z;
const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s, z: a.z * s });

/** Unit vector in the direction of a, or null when a is (nearly) zero. */
function unit(a: Vec): Vec | null {
  const l = Math.sqrt(dot(a, a));
  return l > EPS ? scale(a, 1 / l) : null;
}

/**
 * The closest direction to v that is perpendicular to the unit forward f, normalised.
 * This is the roll that puts v's projection as close as possible to the picture's up.
 * Returns null when v is (nearly) parallel to f, so there is no roll to read off.
 */
function perpUnit(v: Vec, f: Vec): Vec | null {
  return unit(sub(v, scale(f, dot(v, f))));
}

/**
 * Creates a free camera at `eye` looking at `target`, starting upright, with a
 * `bank(up)` method that rolls it so its picture-up follows the given world up.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const f0 = unit(sub(target, eye));
  if (f0 === null) throw new RangeError("createChaseCamera: eye and target must differ");

  // Upright: world Y projected onto the view plane. If the view is vertical, use world Z.
  let roll: Vec = (perpUnit(WORLD_UP, f0) ?? perpUnit(WORLD_Z, f0))!;

  const camera = createFreeCamera(eye, target);
  // Assumed property name and an ObservableVec3-style set(), mirroring target.set in the controls.
  camera.upVector.set(roll.x, roll.y, roll.z);

  function bank(up: Vec): void {
    const f = unit(sub(camera.target, camera.position));
    if (f === null) return;

    const u = unit(up);
    // Degenerate when the car's up is along the line of sight (or zero): keep the previous roll,
    // re-projected onto the current view plane so the camera still looks exactly at the target.
    const next = (u !== null ? perpUnit(u, f) : null) ?? perpUnit(roll, f);
    if (next === null) return;

    roll = next;
    camera.upVector.set(next.x, next.y, next.z);
  }

  return { camera, bank };
}
