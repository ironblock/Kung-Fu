import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;

function subtract(a: Vec, b: Vec): Vec {
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

function normalize(v: Vec): Vec | null {
  const len = Math.sqrt(dot(v, v));
  if (!Number.isFinite(len) || len < EPS) return null;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function same(a: Vec, b: Vec): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz < EPS * EPS;
}

function readVec(value: any): Vec | null {
  if (!value) return null;

  const source =
    value.x !== undefined || value.y !== undefined || value.z !== undefined
      ? value
      : value.value;

  if (!source) return null;

  const x = Number(source.x);
  const y = Number(source.y);
  const z = Number(source.z);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null;
  }

  return { x, y, z };
}

function perpendicularProjection(reference: Vec, forward: Vec): Vec | null {
  const f = normalize(forward);
  const r = normalize(reference);
  if (!f || !r) return null;

  // Clamp tiny floating-point overshoots above/below +/-1.
  const d = Math.max(-1, Math.min(1, dot(f, r)));

  const projected = {
    x: r.x - f.x * d,
    y: r.y - f.y * d,
    z: r.z - f.z * d,
  };

  return normalize(projected);
}

function arbitraryPerpendicular(forward: Vec): Vec | null {
  const f = normalize(forward);
  if (!f) return null;

  const axes: Vec[] = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ];

  let best: Vec | null = null;
  let bestDot = Infinity;

  for (const axis of axes) {
    const p = perpendicularProjection(axis, f);
    if (!p) continue;

    const align = Math.abs(dot(axis, f));
    if (align < bestDot) {
      bestDot = align;
      best = p;
    }
  }

  return best;
}

function computeRight(forward: Vec, up: Vec): Vec | null {
  const f = normalize(forward);
  const u = normalize(up);
  if (!f || !u) return null;

  const right = normalize(cross(u, f));
  if (right) return right;

  return normalize(cross(f, u));
}

function writeUpVector(cam: any, v: Vec): void {
  const target = cam?.upVector ?? cam?._up ?? cam?.up;
  if (!target) return;

  const source =
    target.value && typeof target.value === "object" ? target.value : target;

  if (typeof source.set === "function") {
    source.set(v.x, v.y, v.z);
    return;
  }

  if (typeof source.copyFrom === "function") {
    source.copyFrom(v);
    return;
  }

  if (typeof source.copyFromFloats === "function") {
    source.copyFromFloats(v.x, v.y, v.z);
    return;
  }

  source.x = v.x;
  source.y = v.y;
  source.z = v.z;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const eyeVec = readVec(eye) ?? { x: 0, y: 0, z: 0 };
  const targetVec = readVec(target) ?? { x: 0, y: 0, z: 0 };
  const worldUp = { x: 0, y: 1, z: 0 };

  const initialForward =
    normalize(subtract(targetVec, eyeVec)) ?? { x: 0, y: 0, z: 1 };

  const projectedWorldUp = perpendicularProjection(worldUp, initialForward);
  const initialUp =
    projectedWorldUp ?? arbitraryPerpendicular(initialForward) ?? worldUp;

  const cam = createBankedFreeCamera(
    eyeVec as any,
    targetVec as any,
    initialUp as any
  ) as any;

  const camera = cam as unknown as FreeCamera;

  let previousUp = initialUp;
  let previousRight = computeRight(initialForward, initialUp);

  function applyRoll(forward: Vec, upCandidate: Vec): void {
    previousUp = upCandidate;
    previousRight = computeRight(forward, upCandidate);
    writeUpVector(cam, upCandidate);
  }

  function syncCameraUp(forward: Vec, upCandidate: Vec): void {
    const current = readVec(cam.upVector);

    if (!current || !same(current, upCandidate)) {
      applyRoll(forward, upCandidate);
    } else {
      previousUp = upCandidate;
      previousRight = computeRight(forward, upCandidate);
    }
  }

  return {
    camera,

    bank(up: Vec): void {
      const position = readVec(cam.position) ?? eyeVec;
      const targetPosition = readVec(cam.target) ?? targetVec;

      const forward = normalize(subtract(targetPosition, position));
      if (!forward) return;

      const requestedUp = normalize(up);
      const candidate = requestedUp
        ? perpendicularProjection(requestedUp, forward)
        : null;

      if (candidate) {
        syncCameraUp(forward, candidate);
        return;
      }

      // The requested up is parallel (or nearly parallel) to the line of
      // sight. Preserve the previous roll instead of trying to force an
      // undefined perpendicular direction.
      const keepUp = perpendicularProjection(previousUp, forward);
      if (keepUp) {
        syncCameraUp(forward, keepUp);
        return;
      }

      // If the previous up itself has become parallel to the new line of
      // sight, keep the previous right vector as close as possible and derive
      // a valid up from it.
      if (previousRight) {
        const keepRight = perpendicularProjection(previousRight, forward);
        if (keepRight) {
          const derivedUp = normalize(cross(forward, keepRight));
          if (derivedUp) {
            syncCameraUp(forward, derivedUp);
            return;
          }
        }
      }

      // Last resort: choose a stable perpendicular direction for the current
      // line of sight.
      const fallback = arbitraryPerpendicular(forward);
      if (fallback) {
        syncCameraUp(forward, fallback);
      }
    },
  };
}
