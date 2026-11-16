import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

// Squared length below which the wanted up is treated as parallel to the line of sight.
const DEGENERATE_SQ = 1e-12;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };

/** Unit vector from `from` to `to`, or null if they coincide. */
function directionOf(from: Vec, to: Vec): Vec | null {
  const x = to.x - from.x;
  const y = to.y - from.y;
  const z = to.z - from.z;
  const lenSq = x * x + y * y + z * z;
  if (!(lenSq > DEGENERATE_SQ)) return null;
  const inv = 1 / Math.sqrt(lenSq);
  return { x: x * inv, y: y * inv, z: z * inv };
}

/**
 * The part of `up` perpendicular to the unit `forward`, normalized.
 * This is the roll that makes the camera's up match `up` as closely as possible.
 * Returns null when `up` is (numerically) along `forward`.
 */
function rollUp(up: Vec, forward: Vec): Vec | null {
  const d = up.x * forward.x + up.y * forward.y + up.z * forward.z;
  const x = up.x - d * forward.x;
  const y = up.y - d * forward.y;
  const z = up.z - d * forward.z;
  const lenSq = x * x + y * y + z * z;
  if (!(lenSq > DEGENERATE_SQ)) return null; // also catches NaN
  const inv = 1 / Math.sqrt(lenSq);
  return { x: x * inv, y: y * inv, z: z * inv };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const position: Vec = { x: eye.x, y: eye.y, z: eye.z };
  const look: Vec = { x: target.x, y: target.y, z: target.z };

  const forward = directionOf(position, look);
  if (!forward) {
    throw new Error("createChaseCamera: eye and target must be distinct");
  }

  // Start upright: world up projected onto the view plane, with a fallback
  // for when the view is exactly vertical.
  const initialUp =
    rollUp(WORLD_UP, forward) ?? rollUp(FALLBACK_UP, forward);
  if (!initialUp) {
    throw new Error("createChaseCamera: could not derive an initial up vector");
  }

  const camera = createBankedFreeCamera(position, look, initialUp);

  return {
    camera,
    bank(up: Vec): void {
      const f = directionOf(camera.position, camera.target);
      if (!f) return;

      const roll = rollUp(up, f);
      if (!roll) return; // car up is along the line of sight: keep previous roll

      const u = camera.upVector;
      u.x = roll.x;
      u.y = roll.y;
      u.z = roll.z;
    },
  };
}
