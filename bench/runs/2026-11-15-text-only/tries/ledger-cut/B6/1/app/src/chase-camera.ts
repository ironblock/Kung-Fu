import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, a projected vector is treated as zero (the up direction
// lies along the line of sight).
const EPS = 1e-9;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };
const WORLD_X: Vec = { x: 1, y: 0, z: 0 };

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function len(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

// Unit direction of the part of v that is perpendicular to the unit vector f.
// Returns null when that part is (numerically) zero, which includes NaN input.
function perpUnit(v: Vec, f: Vec): Vec | null {
  const w = sub(v, scale(f, dot(v, f)));
  const l = len(w);
  if (!(l > EPS)) return null;
  return scale(w, 1 / l);
}

// Some unit vector perpendicular to f, used only when nothing else works.
function anyPerp(f: Vec): Vec {
  return perpUnit(WORLD_Z, f) ?? perpUnit(WORLD_X, f) ?? WORLD_Z;
}

function unitOrNull(v: Vec): Vec | null {
  const l = len(v);
  if (!(l > 0) || !Number.isFinite(l)) return null;
  return scale(v, 1 / l);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const d = sub(target, eye);
  const f0 = unitOrNull(d);
  if (f0 === null) throw new Error("createChaseCamera: eye and target must differ");

  // Start upright: world up with its component along the view direction removed.
  const up0 = perpUnit(WORLD_UP, f0) ?? anyPerp(f0);

  // Hand-built camera object. The fields follow the ledger's FreeCamera notes
  // (position, target, and up for the banked view). worldMatrixVersion is the
  // view-cache key and must only ever go up.
  const camera = {
    position: { x: eye.x, y: eye.y, z: eye.z },
    target: { x: target.x, y: target.y, z: target.z },
    up: { x: up0.x, y: up0.y, z: up0.z },
    worldMatrixVersion: 0,
  } as unknown as FreeCamera;

  // Last camera up. Kept so that a degenerate frame can keep the previous roll.
  let prevUp: Vec = up0;

  function bank(up: Vec): void {
    const dir = sub(
      (camera as unknown as { target: Vec }).target,
      (camera as unknown as { position: Vec }).position,
    );
    const f = unitOrNull(dir);
    if (f === null) return; // eye and target coincide; nothing sensible to do

    const u = unitOrNull(up);
    const next =
      (u !== null ? perpUnit(u, f) : null) ??
      // Up lies along the line of sight, or the input is bad: keep the previous
      // roll by re-projecting the last up onto the current view plane.
      perpUnit(prevUp, f) ??
      anyPerp(f);

    prevUp = next;
    const c = camera as unknown as { up: Vec; worldMatrixVersion: number };
    c.up = { x: next.x, y: next.y, z: next.z };
    // A transform change: bump the version so the cached view matrix is rebuilt.
    c.worldMatrixVersion += 1;
  }

  return { camera, bank };
}
