import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point` instead of its current target.
 *
 * The camera's position is derived from target + (alpha, beta, radius), so
 * replacing the target moves the camera by exactly (point - oldTarget) while
 * keeping its angles and distance, and the view looks straight at `point`.
 * Safe to call repeatedly: it sets absolute values, it does not accumulate.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Assign a fresh object so we neither alias the caller's `point` nor
  // depend on how the library stores the target internally.
  camera.target = { x: point.x, y: point.y, z: point.z };

  // Panning inertia would keep shifting the target on the next update and
  // pull the camera off `point`, so clear it. Angular/radial inertia is left
  // alone: it orbits around the new target just as well.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
