import type { ArcRotateCamera } from "@babylonjs/lite";

type MutableVec3Like = {
  x: number;
  y: number;
  z: number;
  copyFrom?: (source: { x: number; y: number; z: number }) => void;
};

type CameraCacheState = {
  _viewVer?: number;
  _projVer?: number;
  _vpVer?: number;
  _projAspect?: number;
  _vpAspect?: number;
  _projRev?: number;
  _projFov?: number;
  _projNear?: number;
  _projFar?: number;
  worldMatrixVersion?: number;
  _worldMatrixVersion?: number;
};

function trySet(obj: unknown, key: string, value: unknown): void {
  try {
    (obj as Record<string, unknown>)[key] = value;
  } catch {
    // Some library versions may expose readonly or accessor-only cache fields.
  }
}

function bumpVersion(obj: unknown, key: string): void {
  try {
    const current = (obj as Record<string, unknown>)[key];
    if (typeof current === "number") {
      (obj as Record<string, unknown>)[key] = current + 1;
    }
  } catch {
    // Ignore readonly or accessor-only version fields.
  }
}

function readNumber(obj: unknown, key: string): number | undefined {
  try {
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "number" ? value : undefined;
  } catch {
    return undefined;
  }
}

function toFiniteNumber(value: unknown): number | null {
  try {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function cloneTarget(
  current: ArcRotateCamera["target"],
  x: number,
  y: number,
  z: number
): unknown {
  try {
    const proto = Object.getPrototypeOf(current) as object | null;
    if (proto) {
      const clone = Object.create(proto) as MutableVec3Like;
      clone.x = x;
      clone.y = y;
      clone.z = z;
      return clone;
    }
  } catch {
    // If the prototype cannot be cloned, fall back to a plain vector-like object.
  }

  return { x, y, z };
}

function setTarget(camera: ArcRotateCamera, x: number, y: number, z: number): void {
  let current: ArcRotateCamera["target"] | undefined;

  try {
    current = camera.target;
  } catch {
    current = undefined;
  }

  if (current) {
    const target = current as unknown as MutableVec3Like;
    let changed = false;

    // Prefer copyFrom when available, because the target may be an observable
    // or class-backed vector that wants its own copy method to be used.
    if (typeof target.copyFrom === "function") {
      try {
        target.copyFrom({ x, y, z });
        changed = true;
      } catch {
        // Fall back to direct field assignment below.
      }
    }

    if (!changed) {
      try {
        target.x = x;
        target.y = y;
        target.z = z;
        changed = true;
      } catch {
        // The target object may be frozen; fall back below.
      }
    }

    if (changed) {
      // Reassigning the same object is harmless if target is a plain property,
      // and may trigger a setter if ArcRotateCamera.target is accessor-backed.
      trySet(camera, "target", current);

      // If a getter/setter pair ignored the same-object assignment or returned
      // stale values, try assigning a fresh clone with the same values.
      try {
        const check = camera.target as unknown as MutableVec3Like;
        if (check.x !== x || check.y !== y || check.z !== z) {
          trySet(camera, "target", cloneTarget(current, x, y, z));
        }
      } catch {
        // Ignore verification failures.
      }
    } else {
      trySet(camera, "target", cloneTarget(current, x, y, z));
    }
  } else {
    trySet(camera, "target", { x, y, z });
  }
}

function invalidateCamera(camera: ArcRotateCamera): void {
  const state = camera as unknown as CameraCacheState;

  // Clear the camera matrix caches so getCameraPosition / getViewMatrix /
  // getViewProjectionMatrix see the new target immediately in this frame.
  trySet(state, "_viewVer", undefined);
  trySet(state, "_projVer", undefined);
  trySet(state, "_vpVer", undefined);
  trySet(state, "_projAspect", undefined);
  trySet(state, "_vpAspect", undefined);
  trySet(state, "_projRev", undefined);
  trySet(state, "_projFov", undefined);
  trySet(state, "_projNear", undefined);
  trySet(state, "_projFar", undefined);

  // Best-effort world matrix dirtying. If the property is readonly in this
  // library version, the assignment is ignored.
  bumpVersion(state, "worldMatrixVersion");
  bumpVersion(state, "_worldMatrixVersion");
}

export function focusOn(
  camera: ArcRotateCamera,
  point: { x: number; y: number; z: number }
): void {
  if (!camera || !point) return;

  let x: number | null = null;
  let y: number | null = null;
  let z: number | null = null;

  try {
    x = toFiniteNumber(point.x);
    y = toFiniteNumber(point.y);
    z = toFiniteNumber(point.z);
  } catch {
    return;
  }

  if (x === null || y === null || z === null) return;

  // Preserve the current orbit state even if the target setter has side effects.
  const alpha = readNumber(camera, "alpha");
  const beta = readNumber(camera, "beta");
  const radius = readNumber(camera, "radius");

  setTarget(camera, x, y, z);

  if (alpha !== undefined && Number.isFinite(alpha)) {
    trySet(camera, "alpha", alpha);
  }
  if (beta !== undefined && Number.isFinite(beta)) {
    trySet(camera, "beta", beta);
  }
  if (radius !== undefined && Number.isFinite(radius)) {
    trySet(camera, "radius", radius);
  }

  invalidateCamera(camera);
}
