import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-12;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const FALLBACK_A: Vec = { x: 1, y: 0, z: 0 };
const FALLBACK_B: Vec = { x: 0, y: 0, z: 1 };

function readVec(value: unknown): Vec {
  const v = value as any;
  return {
    x: Number(v?.x ?? 0),
    y: Number(v?.y ?? 0),
    z: Number(v?.z ?? 0),
  };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function subtract(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function length(v: Vec): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: Vec): Vec | null {
  const len = length(v);
  if (!Number.isFinite(len) || len <= EPS) return null;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function closestPerpendicularUp(up: Vec, direction: Vec): Vec | null {
  const n = normalize(up);
  const d = normalize(direction);
  if (!n || !d) return null;

  const parallelComponent = dot(n, d);
  const residual = {
    x: n.x - parallelComponent * d.x,
    y: n.y - parallelComponent * d.y,
    z: n.z - parallelComponent * d.z,
  };

  return normalize(residual);
}

function initialUp(direction: Vec | null): Vec {
  if (!direction) return { ...WORLD_UP };

  const worldUp = closestPerpendicularUp(WORLD_UP, direction);
  if (worldUp) return worldUp;

  const x = closestPerpendicularUp(FALLBACK_A, direction);
  if (x) return x;

  const z = closestPerpendicularUp(FALLBACK_B, direction);
  if (z) return z;

  return { ...WORLD_UP };
}

function writeVec(target: unknown, value: Vec): void {
  const v = target as any;
  if (!v) return;

  if (typeof v.copyFrom === "function") {
    try {
      v.copyFrom(value);
      return;
    } catch {
      // fall through and try another mutation strategy
    }
  }

  if (typeof v.copyFromFloats === "function") {
    try {
      v.copyFromFloats(value.x, value.y, value.z);
      return;
    } catch {
      // fall through and try another mutation strategy
    }
  }

  if (typeof v.set === "function") {
    try {
      v.set(value.x, value.y, value.z);
      return;
    } catch {
      // fall through and try direct assignment
    }
  }

  v.x = value.x;
  v.y = value.y;
  v.z = value.z;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const initialDirection = normalize(subtract(target, eye));
  const upright = initialUp(initialDirection);

  const banked = createBankedFreeCamera(
    eye as any,
    target as any,
    upright as any
  );
  const camera: FreeCamera = banked;

  const bank = (up: Vec): void => {
    const position = readVec((camera as any).position);
    const lookAt = readVec((camera as any).target);
    const lineOfSight = normalize(subtract(lookAt, position));

    if (!lineOfSight) return;

    const desiredUp = closestPerpendicularUp(up, lineOfSight);

    // If the car's up is parallel or anti-parallel to the line of sight,
    // roll is undefined; keep the camera's previous roll.
    if (!desiredUp) return;

    writeVec((banked as any).upVector, desiredUp);
  };

  return { camera, bank };
}
