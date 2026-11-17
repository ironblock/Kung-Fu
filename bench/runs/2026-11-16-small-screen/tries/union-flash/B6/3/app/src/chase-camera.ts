import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

type ObservableVecLike = Vec & {
  copyFrom?: (source: Vec) => void;
  set?: (x: number, y: number, z: number) => void;
};

type BankedLike = FreeCamera & {
  upVector?: ObservableVecLike;
};

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const DEFAULT_FORWARD: Vec = { x: 0, y: 0, z: 1 };

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function readVec(value: unknown): Vec {
  const maybe = value as { x?: number; y?: number; z?: number } | null | undefined;
  return {
    x: num(maybe?.x),
    y: num(maybe?.y),
    z: num(maybe?.z),
  };
}

function clone(v: Vec): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function lengthSq(v: Vec): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

function normalizeOrNull(v: Vec): Vec | null {
  const l = Math.sqrt(lengthSq(v));
  if (l <= EPS || !Number.isFinite(l)) return null;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function normalizeOr(v: Vec, fallback: Vec): Vec {
  const n = normalizeOrNull(v);
  if (n) return n;

  const f = normalizeOrNull(fallback);
  if (f) return f;

  return clone(DEFAULT_FORWARD);
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec, b: Vec): Vec {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function perpendicular(v: Vec, axis: Vec): Vec | null {
  const d = dot(v, axis);
  const p = {
    x: v.x - d * axis.x,
    y: v.y - d * axis.y,
    z: v.z - d * axis.z,
  };
  return normalizeOrNull(p);
}

function arbitraryPerpendicular(axis: Vec): Vec {
  const ax = Math.abs(axis.x);
  const ay = Math.abs(axis.y);
  const az = Math.abs(axis.z);

  let ref: Vec;
  if (ax <= ay && ax <= az) {
    ref = { x: 1, y: 0, z: 0 };
  } else if (ay <= az) {
    ref = { x: 0, y: 1, z: 0 };
  } else {
    ref = { x: 0, y: 0, z: 1 };
  }

  const n = normalizeOrNull(cross(axis, ref));
  if (n) return n;

  const n2 = normalizeOrNull(cross(ref, axis));
  if (n2) return n2;

  return clone(DEFAULT_FORWARD);
}

function negate(v: Vec): Vec {
  return { x: -v.x, y: -v.y, z: -v.z };
}

function chooseCameraUp(
  desired: Vec,
  forward: Vec,
  previousUp: Vec,
  previousForward: Vec
): Vec {
  // Preferred: the car's up projected onto the plane perpendicular to the view direction.
  const fromDesired = perpendicular(desired, forward);
  if (fromDesired) return fromDesired;

  // Singular: the requested up is exactly along the line of sight.
  // Keep the previous roll by preserving the previous camera up as closely as possible.
  const fromPrevious = perpendicular(previousUp, forward);
  if (fromPrevious) return fromPrevious;

  // If the previous up itself became parallel to the new view direction, keep the
  // previous right/backward relationship by using the previous backward direction.
  const fromPreviousBackward = perpendicular(negate(previousForward), forward);
  if (fromPreviousBackward) return fromPreviousBackward;

  // Last-resort stable perpendicular vector.
  return arbitraryPerpendicular(forward);
}

function writeCameraUp(cam: BankedLike, up: Vec): void {
  const v = cam.upVector;
  if (!v) return;

  if (typeof v.copyFrom === "function") {
    v.copyFrom(up);
  } else if (typeof v.set === "function") {
    v.set(up.x, up.y, up.z);
  } else {
    v.x = up.x;
    v.y = up.y;
    v.z = up.z;
  }
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const eyePos = readVec(eye);
  const targetPos = readVec(target);

  const forward = normalizeOr(sub(targetPos, eyePos), DEFAULT_FORWARD);

  // Start upright: use world +Y when possible; if that is singular, choose a
  // stable perpendicular up so the banked camera can build a valid basis.
  const initialUp = perpendicular(WORLD_UP, forward) ?? arbitraryPerpendicular(forward);

  // Only BankedFreeCamera exposes an upVector that can roll the camera.
  const createBanked = createBankedFreeCamera as unknown as (
    position: Vec,
    target: Vec,
    up?: Vec
  ) => BankedLike;

  const cam = createBanked(eyePos, targetPos, initialUp);

  let lastForward = forward;
  let lastUp = initialUp;

  const bank = (up: Vec): void => {
    const pos = readVec(cam.position);
    const tgt = readVec(cam.target);

    const currentForward = normalizeOr(sub(tgt, pos), lastForward);
    const desired = normalizeOr(readVec(up), WORLD_UP);

    const nextUp = chooseCameraUp(desired, currentForward, lastUp, lastForward);

    writeCameraUp(cam, nextUp);

    lastForward = currentForward;
    lastUp = nextUp;
  };

  return { camera: cam, bank };
}
