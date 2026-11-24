import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

/** Below this length, the component of a vector perpendicular to the line of sight counts as zero. */
const PARALLEL_EPSILON = 1e-6;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Unit vector along v, or null if v is zero or not finite. */
function unitOrNull(v: Vec): Vec | null {
  const l = Math.sqrt(dot(v, v));
  if (!(l > 0) || !Number.isFinite(l)) return null;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

/**
 * The part of v perpendicular to the unit vector f, scaled to unit length.
 * Returns null when v is zero or (nearly) parallel to f, so there is no defined direction.
 */
function perpendicularUnit(v: Vec, f: Vec): Vec | null {
  const vu = unitOrNull(v);
  if (!vu) return null;
  const d = dot(vu, f);
  const p = { x: vu.x - d * f.x, y: vu.y - d * f.y, z: vu.z - d * f.z };
  const pl = Math.sqrt(dot(p, p));
  if (!(pl > PARALLEL_EPSILON)) return null;
  return { x: p.x / pl, y: p.y / pl, z: p.z / pl };
}

/** Unit line of sight from the camera's current position to its current target. */
function lineOfSight(camera: FreeCamera): Vec | null {
  return unitOrNull({
    x: camera.target.x - camera.position.x,
    y: camera.target.y - camera.position.y,
    z: camera.target.z - camera.position.z,
  });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const start: Vec = { x: eye.x, y: eye.y, z: eye.z };
  const aim: Vec = { x: target.x, y: target.y, z: target.z };

  // Starting up direction: world +Y projected onto the view plane (upright),
  // falling back to world +Z if the view is exactly vertical.
  const startDir = unitOrNull({
    x: aim.x - start.x,
    y: aim.y - start.y,
    z: aim.z - start.z,
  });
  const startUp: Vec = startDir
    ? (perpendicularUnit(WORLD_UP, startDir) ?? perpendicularUnit(WORLD_Z, startDir) ?? { ...WORLD_UP })
    : { ...WORLD_UP };

  const camera = createBankedFreeCamera(start, aim, { ...startUp });

  // Last picture-up direction we applied, unit length and perpendicular to the line of sight.
  let lastUp: Vec = startUp;

  return {
    camera,
    bank(up: Vec): void {
      const forward = lineOfSight(camera);
      if (!forward) return; // no defined view direction: keep the roll as it is

      // Closest achievable picture-up to the car's up. Null if up is zero or along the line of sight.
      const wanted = perpendicularUnit(up, forward);

      // Along the line of sight: keep the previous roll by re-projecting the last picture-up
      // onto the current view plane.
      const next = wanted ?? perpendicularUnit(lastUp, forward);
      if (!next) return;

      lastUp = next;
      camera.upVector.x = next.x;
      camera.upVector.y = next.y;
      camera.upVector.z = next.z;
    },
  };
}
