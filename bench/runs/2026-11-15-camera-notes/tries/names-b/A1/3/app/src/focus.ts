import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its current target.
 *
 * The camera position is derived from `target` plus alpha/beta/radius, so
 * replacing the target while keeping the angles and radius moves the camera
 * by the same offset as the target and keeps it looking straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // A new object rather than in-place writes, so any cache keyed on the
  // target's identity is invalidated; the caller's `point` is not aliased.
  camera.target = { x: point.x, y: point.y, z: point.z };

  // Pending pan inertia would keep sliding the target away from `point`
  // after this call, so drop it.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
