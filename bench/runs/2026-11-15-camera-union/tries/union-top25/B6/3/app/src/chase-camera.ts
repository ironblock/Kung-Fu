import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the car's up is treated as parallel to the line of sight.
const DEGENERATE_EPS = 1e-9;

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

// Component of `v` perpendicular to unit vector `f`. Returns null if nothing is left.
function perpendicularTo(v: Vec, f: Vec): Vec | null {
  const d = dot(v, f);
  const p = { x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z };
  const len = length(p);
  if (len < DEGENERATE_EPS) return null;
  return { x: p.x / len, y: p.y / len, z: p.z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const offset = sub(target, eye);
  const dist = length(offset);
  if (dist === 0) {
    throw new Error("createChaseCamera: eye and target must differ");
  }
  const forward = { x: offset.x / dist, y: offset.y / dist, z: offset.z / dist };

  // Start upright: world up made perpendicular to the line of sight.
  // If the line of sight is vertical, fall back to world Z so the roll is still defined.
  const start =
    perpendicularTo({ x: 0, y: 1, z: 0 }, forward) ??
    perpendicularTo({ x: 0, y: 0, z: 1 }, forward)!;

  const camera = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    { x: start.x, y: start.y, z: start.z },
  );

  function bank(up: Vec): void {
    const roll = perpendicularTo(up, forward);
    // Car's up is along the line of sight: keep the previous roll.
    if (roll === null) return;
    const vec = camera.upVector;
    vec.x = roll.x;
    vec.y = roll.y;
    vec.z = roll.z;
  }

  return { camera, bank };
}
