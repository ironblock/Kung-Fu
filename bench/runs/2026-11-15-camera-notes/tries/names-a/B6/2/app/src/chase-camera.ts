import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length the wanted up is (numerically) along the line of sight,
// so there is no well-defined roll and the previous roll is kept.
const DEGENERATE_EPS = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const upright = { x: 0, y: 1, z: 0 };
  const banked = createBankedFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
    upright,
  );

  // Unit forward vector (eye -> target). The camera does not move, so it is
  // computed once.
  let fx = target.x - eye.x;
  let fy = target.y - eye.y;
  let fz = target.z - eye.z;
  const fl = Math.hypot(fx, fy, fz);
  if (!(fl > 0)) throw new Error("createChaseCamera: eye and target coincide");
  fx /= fl; fy /= fl; fz /= fl;

  const upVector = banked.upVector;

  return {
    camera: banked,
    bank(up: Vec): void {
      // Normalise the requested up defensively.
      const ul = Math.hypot(up.x, up.y, up.z);
      if (!(ul > 0)) return;
      const ux = up.x / ul, uy = up.y / ul, uz = up.z / ul;

      // Remove the component along the line of sight: the result is the
      // closest up direction the camera can have while still looking at target.
      const d = ux * fx + uy * fy + uz * fz;
      const px = ux - d * fx;
      const py = uy - d * fy;
      const pz = uz - d * fz;
      const pl = Math.hypot(px, py, pz);

      // Degenerate: up is along the line of sight. Keep the previous roll.
      if (pl < DEGENERATE_EPS) return;

      upVector.x = px / pl;
      upVector.y = py / pl;
      upVector.z = pz / pl;
    },
  };
}
