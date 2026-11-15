import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point` instead of its current target.
 *
 * alpha, beta and radius are left alone, so the camera position moves by the
 * same offset as the target (point - oldTarget) and it looks straight at `point`.
 * Subsequent changes to alpha, beta or radius orbit `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Copy the point so later changes to the caller's object don't move the camera.
  camera.target = { x: point.x, y: point.y, z: point.z };

  // Drop any pending inertial motion. Otherwise the angles, distance or target
  // would keep drifting after the call, and the camera would not sit on `point`.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
