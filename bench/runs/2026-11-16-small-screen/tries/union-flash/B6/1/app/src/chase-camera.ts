import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;
const EPS2 = EPS * EPS;

type MutableVec = { x: number; y: number; z: number };
type ObservableLike = MutableVec & {
  set?: (x: number, y: number, z: number) => void;
  copy?: (v: MutableVec) => void;
  markDirty?: () => void;
};

function finite(v: Vec): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
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

function normalize(v: Vec): Vec | null {
  if (!finite(v)) return null;

  // Scale first so very large or very small vectors normalize safely.
  const max = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
  if (!Number.isFinite(max) || max <= EPS) return null;

  const sx = v.x / max;
  const sy = v.y / max;
  const sz = v.z / max;
  const len = Math.sqrt(sx * sx + sy * sy + sz * sz);
  if (!Number.isFinite(len) || len <= EPS) return null;

  const inv = (1 / len) / max;
  return { x: v.x * inv, y: v.y * inv, z: v.z * inv };
}

function perpendicularComponent(v: Vec, f: Vec): Vec | null {
  if (!finite(v) || !finite(f)) return null;

  const d = dot(v, f);
  const px = v.x - d * f.x;
  const py = v.y - d * f.y;
  const pz = v.z - d * f.z;
  const lenSq = px * px + py * py + pz * pz;

  if (!Number.isFinite(lenSq) || lenSq <= EPS2) return null;

  const inv = 1 / Math.sqrt(lenSq);
  return { x: px * inv, y: py * inv, z: pz * inv };
}

function arbitraryPerp(f: Vec): Vec {
  const axes: MutableVec[] = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ];

  let best = axes[0];
  let bestScore = Math.abs(dot(f, best));

  for (const axis of axes) {
    const score = Math.abs(dot(f, axis));
    if (score < bestScore) {
      bestScore = score;
      best = axis;
    }
  }

  const result = normalize(cross(f, best));
  if (result) return result;

  const fallback =
    perpendicularComponent({ x: 0, y: 1, z: 0 }, f) ??
    perpendicularComponent({ x: 1, y: 0, z: 0 }, f) ??
    perpendicularComponent({ x: 0, y: 0, z: 1 }, f);

  return fallback ?? { x: 0, y: 1, z: 0 };
}

function stableUp(f: Vec, preferred?: Vec | null): Vec {
  const attempts: Vec[] = [];

  if (preferred) attempts.push(preferred);
  attempts.push({ x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });

  for (const attempt of attempts) {
    const result = perpendicularComponent(attempt, f);
    if (result) return result;
  }

  return arbitraryPerp(f);
}

function getObservableLike(cam: FreeCamera, key: string): ObservableLike | null {
  const value = (cam as unknown as Record<string, unknown>)[key];
  if (value && typeof value === "object") return value as ObservableLike;
  return null;
}

function getCameraUp(cam: FreeCamera): ObservableLike | null {
  return getObservableLike(cam, "upVector") ?? getObservableLike(cam, "up");
}

function setVec(vec: ObservableLike | null | undefined, v: Vec): void {
  if (!vec) return;

  if (typeof vec.set === "function") {
    vec.set(v.x, v.y, v.z);
  } else if (typeof vec.copy === "function") {
    vec.copy(v);
  } else {
    vec.x = v.x;
    vec.y = v.y;
    vec.z = v.z;
  }

  if (typeof vec.markDirty === "function") vec.markDirty();
}

function readVec(vec: ObservableLike | null | undefined): Vec | null {
  if (!vec) return null;
  return normalize({ x: vec.x, y: vec.y, z: vec.z });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const e = { x: eye.x, y: eye.y, z: eye.z };
  const t = { x: target.x, y: target.y, z: target.z };

  const initialForward = normalize({
    x: t.x - e.x,
    y: t.y - e.y,
    z: t.z - e.z,
  });

  const initialUp = initialForward
    ? stableUp(initialForward)
    : { x: 0, y: 1, z: 0 };

  const camera = createBankedFreeCamera(
    { x: e.x, y: e.y, z: e.z },
    { x: t.x, y: t.y, z: t.z },
    { ...initialUp }
  ) as FreeCamera;

  let lastUp = { ...initialUp };
  let lastForward = initialForward ? { ...initialForward } : null;

  // Ensure the camera really starts at eye/target and upright, in case the
  // factory does not fully initialize these observable vectors.
  setVec(getObservableLike(camera, "position"), e);
  setVec(getObservableLike(camera, "target"), t);
  setVec(getCameraUp(camera), lastUp);

  return {
    camera,
    bank(up: Vec): void {
      const u = normalize(up);
      if (!u) return;

      const position = getObservableLike(camera, "position");
      const lookAt = getObservableLike(camera, "target");
      if (!position || !lookAt) return;

      const forward = normalize({
        x: lookAt.x - position.x,
        y: lookAt.y - position.y,
        z: lookAt.z - position.z,
      });
      if (!forward) return;

      // Normal case: roll to the component of the car's up that lies in the
      // plane perpendicular to the current line of sight. That is the closest
      // possible match to the requested up while still looking at target.
      const desired = perpendicularComponent(u, forward);
      if (desired) {
        lastUp = desired;
        lastForward = { ...forward };
        setVec(getCameraUp(camera), desired);
        return;
      }

      // Singularity: the car's up is along, or opposite, the line of sight.
      // Keep the previous roll by projecting the previous camera up onto the
      // plane perpendicular to the current forward direction.
      const previous = readVec(getCameraUp(camera)) ?? lastUp;
      const preserved = perpendicularComponent(previous, forward);
      if (preserved) {
        lastUp = preserved;
        lastForward = { ...forward };
        setVec(getCameraUp(camera), preserved);
        return;
      }

      // If the previous up itself has become parallel to the current forward
      // direction, fall back to the previous right vector when available.
      if (lastForward) {
        const previousRight = normalize(cross(previous, lastForward));
        const rightPreserved = previousRight
          ? perpendicularComponent(previousRight, forward)
          : null;

        if (rightPreserved) {
          lastUp = rightPreserved;
          lastForward = { ...forward };
          setVec(getCameraUp(camera), rightPreserved);
          return;
        }
      }

      // If neither previous up nor previous right can be preserved, choose a
      // stable up perpendicular to the current forward direction while still
      // leaving the target untouched.
      const fallback = stableUp(forward, previous);
      lastUp = fallback;
      lastForward = { ...forward };
      setVec(getCameraUp(camera), fallback);
    },
  };
}
