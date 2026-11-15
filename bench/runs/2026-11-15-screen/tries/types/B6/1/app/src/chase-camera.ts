import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

/** Below this length the projected up is treated as parallel to the line of sight. */
const DEGENERATE_EPSILON = 1e-9;

type BankedCamera = ReturnType<typeof createBankedFreeCamera>;

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Component of `v` perpendicular to the unit vector `forward`, normalized.
 * Returns null when `v` is (numerically) parallel to `forward` or not finite,
 * in which case there is no well-defined roll and the caller keeps its previous one.
 */
function perpendicularUnit(v: Vec, forward: Vec): Vec | null {
  const d = dot(v, forward);
  const x = v.x - d * forward.x;
  const y = v.y - d * forward.y;
  const z = v.z - d * forward.z;
  const len = Math.hypot(x, y, z);
  if (!(len > DEGENERATE_EPSILON)) return null; // also rejects NaN
  return { x: x / len, y: y / len, z: z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;
  const dist = Math.hypot(dx, dy, dz);
  if (!(dist > 0)) {
    throw new RangeError("createChaseCamera: eye and target must be distinct");
  }
  const forward: Vec = { x: dx / dist, y: dy / dist, z: dz / dist };

  // Upright start: world +Y projected onto the view plane. If the view is exactly
  // vertical, fall back to +Z, which cannot also be parallel to the view direction.
  const initialUp =
    perpendicularUnit({ x: 0, y: 1, z: 0 }, forward) ??
    perpendicularUnit({ x: 0, y: 0, z: 1 }, forward)!;

  const camera: BankedCamera = createBankedFreeCamera(eye, target, initialUp);
  let currentUp: Vec = initialUp;

  return {
    camera,
    bank(up: Vec): void {
      // Closest picture-up to the car's up: its component perpendicular to the line of sight.
      const next = perpendicularUnit(up, forward);
      if (next === null) return; // degenerate: keep the previous roll
      currentUp = next;
      const u = camera.upVector;
      u.x = currentUp.x;
      u.y = currentUp.y;
      u.z = currentUp.z;
    },
  };
}
