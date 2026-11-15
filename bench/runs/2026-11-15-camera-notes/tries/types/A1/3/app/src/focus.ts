import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make an arc-rotate camera orbit `point` instead of its current target.
 *
 * alpha, beta and radius are left alone, so the camera keeps its angles and
 * distance and moves by the same offset as the centre does. Writing the target
 * makes the camera look straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // `target` is an ObservableVec3, so write its components in place. Replacing
  // the object would bypass the change notification.
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Discard any inertia left by earlier drags or zooms. Otherwise the controls
  // would keep applying it and move the camera away from `point`.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
