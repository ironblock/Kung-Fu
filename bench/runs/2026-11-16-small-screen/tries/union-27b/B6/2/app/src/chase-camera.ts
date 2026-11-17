import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-6;

function normalizeInto(x: number, y: number, z: number, out: Vec): boolean {
  const len = Math.hypot(x, y, z);
  if (!Number.isFinite(len) || len < EPS) return false;
  out.x = x / len;
  out.y = y / len;
  out.z = z / len;
  return true;
}

function projectToPlane(out: Vec, v: Vec, f: Vec): boolean {
  const dot = v.x * f.x + v.y * f.y + v.z * f.z;
  const x = v.x - dot * f.x;
  const y = v.y - dot * f.y;
  const z = v.z - dot * f.z;
  const len = Math.hypot(x, y, z);
  if (!Number.isFinite(len) || len < EPS) return false;
  out.x = x / len;
  out.y = y / len;
  out.z = z / len;
  return true;
}

function uprightUp(f: Vec): Vec {
  const out: Vec = { x: 0, y: 1, z: 0 };
  const candidates: Vec[] = [
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
  ];
  for (const c of candidates) {
    if (projectToPlane(out, c, f)) return out;
  }
  out.x = 0;
  out.y = 1;
  out.z = 0;
  return out;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const f: Vec = { x: 0, y: 0, z: 0 };
  const initialUp = normalizeInto(
    target.x - eye.x,
    target.y - eye.y,
    target.z - eye.z,
    f
  )
    ? uprightUp(f)
    : { x: 0, y: 1, z: 0 };

  const banked = createBankedFreeCamera(eye, target, initialUp);
  const camera: FreeCamera = banked;

  return {
    camera,
    bank(up: Vec): void {
      const pos = camera.position;
      const tgt = camera.target;
      const f: Vec = { x: 0, y: 0, z: 0 };
      if (!normalizeInto(tgt.x - pos.x, tgt.y - pos.y, tgt.z - pos.z, f)) return;

      const u: Vec = { x: 0, y: 0, z: 0 };
      if (!normalizeInto(up.x, up.y, up.z, u)) return;

      const desired: Vec = { x: 0, y: 0, z: 0 };
      if (!projectToPlane(desired, u, f)) return;

      banked.upVector.x = desired.x;
      banked.upVector.y = desired.y;
      banked.upVector.z = desired.z;
    },
  };
}
