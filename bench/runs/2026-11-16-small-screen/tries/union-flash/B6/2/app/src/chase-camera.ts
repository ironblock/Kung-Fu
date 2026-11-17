import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-7;

const AXIS_X: Vec = { x: 1, y: 0, z: 0 };
const AXIS_Y: Vec = { x: 0, y: 1, z: 0 };
const AXIS_Z: Vec = { x: 0, y: 0, z: 1 };
const FALLBACK_AXES: readonly Vec[] = [AXIS_X, AXIS_Y, AXIS_Z];

function safeProp(obj: unknown, key: string): unknown {
  try {
    return (obj as any)[key];
  } catch {
    return undefined;
  }
}

function readVec(source: unknown): Vec | null {
  if (!source || typeof source !== "object") return null;

  try {
    const v = source as Partial<Vec>;
    if (typeof v.x !== "number" || typeof v.y !== "number" || typeof v.z !== "number") return null;
    if (!Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z)) return null;
    return { x: v.x, y: v.y, z: v.z };
  } catch {
    return null;
  }
}

function finite(v: Vec): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: Vec): Vec | null {
  if (!finite(v)) return null;

  const len = length(v);
  if (!Number.isFinite(len) || len < EPS) return null;

  return {
    x: v.x / len,
    y: v.y / len,
    z: v.z / len,
  };
}

function normalizeSafe(source: unknown): Vec | null {
  const v = readVec(source);
  return v ? normalize(v) : null;
}

function subtract(a: Vec, b: Vec): Vec {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

function writeVec(target: unknown, v: Vec): void {
  if (!target || typeof target !== "object") return;
  if (!finite(v)) return;

  const t = target as any;
  const attempts: Array<() => void> = [];

  if (typeof t.copyFromFloats === "function") {
    attempts.push(() => t.copyFromFloats(v.x, v.y, v.z));
  }
  if (typeof t.copyFrom === "function") {
    attempts.push(() => t.copyFrom(v));
  }
  if (typeof t.set === "function") {
    attempts.push(() => t.set(v.x, v.y, v.z));
  }

  attempts.push(() => {
    t.x = v.x;
    t.y = v.y;
    t.z = v.z;
  });

  for (const attempt of attempts) {
    try {
      attempt();
      return;
    } catch {
      // Try the next writer.
    }
  }
}

function writeIfChanged(vec: unknown, v: Vec): void {
  const current = readVec(vec);
  if (current) {
    const len = length(current);
    if (Number.isFinite(len) && len > EPS) {
      const d = dot(current, v) / len;
      if (Number.isFinite(d) && d >= 1 - EPS) return;
    }
  }

  writeVec(vec, v);
}

function currentForward(camera: unknown): Vec | null {
  const pos = readVec(safeProp(camera, "position"));
  const tgt = readVec(safeProp(camera, "target"));
  if (!pos || !tgt) return null;

  return normalize(subtract(tgt, pos));
}

/**
 * Remove the component along `forward`, then normalize.
 * Returns null when `desired` is parallel/anti-parallel to `forward`.
 */
function projectToPlane(desired: Vec, forward: Vec): Vec | null {
  const d = dot(desired, forward);
  if (!Number.isFinite(d) || Math.abs(d) >= 1 - EPS) return null;

  const projected = {
    x: desired.x - forward.x * d,
    y: desired.y - forward.y * d,
    z: desired.z - forward.z * d,
  };

  return normalize(projected);
}

function makePerpendicular(desired: Vec, forward: Vec): Vec | null {
  const p = projectToPlane(desired, forward);
  if (p) return p;

  for (const axis of FALLBACK_AXES) {
    const q = projectToPlane(axis, forward);
    if (q) return q;
  }

  return null;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const initialEye = readVec(eye) ?? { x: 0, y: 0, z: 0 };
  const initialTarget = readVec(target) ?? { x: 0, y: 0, z: 0 };
  const initialWorldUp = { x: 0, y: 1, z: 0 };

  const camera = createBankedFreeCamera(
    initialEye as any,
    initialTarget as any,
    initialWorldUp as any
  ) as FreeCamera;

  const upVector = safeProp(camera, "upVector");

  let lastUp: Vec = { x: 0, y: 1, z: 0 };

  const forward = currentForward(camera);
  if (forward) {
    const initialUp = makePerpendicular({ x: 0, y: 1, z: 0 }, forward);
    if (initialUp) {
      lastUp = initialUp;
      writeIfChanged(upVector, initialUp);
    }
  }

  function bank(up: Vec): void {
    const desired = normalizeSafe(up);
    if (!desired) return;

    const f = currentForward(camera);
    if (!f) return;

    const requestedUp = projectToPlane(desired, f);

    if (requestedUp) {
      lastUp = requestedUp;
      writeIfChanged(upVector, requestedUp);
      return;
    }

    // The requested up is parallel or anti-parallel to the line of sight.
    // There is no valid perpendicular "picture up" that can match it, so
    // preserve the previous roll.
    const current = normalizeSafe(upVector);
    let preserved = current ? projectToPlane(current, f) : null;

    if (!preserved) {
      preserved = projectToPlane(lastUp, f);
    }

    if (!preserved) return;

    lastUp = preserved;
    writeIfChanged(upVector, preserved);
  }

  return { camera, bank };
}
