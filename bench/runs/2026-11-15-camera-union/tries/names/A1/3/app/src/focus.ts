import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * alpha, beta and radius are left unchanged, so the camera position moves by
 * the same offset as the orbit centre (target) does, and the camera looks
 * straight at `point`. The target is replaced with a copy so the caller's
 * object is not aliased by the camera.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  camera.target = { x: point.x, y: point.y, z: point.z };

  // Pending pan inertia would move the target off `point` on the next update,
  // so clear it. The angular and radius inertia do not move the target.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
