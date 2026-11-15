import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`. Its alpha, beta and radius are left
 * untouched, so it moves by the same offset as the old target-to-point offset and
 * still looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Write the components in place. Assigning a new object to camera.target would
  // leave the camera's cached world matrix stale until alpha, beta or radius changes.
  camera.target.x = point.x;
  camera.target.y = point.y;
  camera.target.z = point.z;

  // A pending pan would be applied on the next frame and pull the target off `point`.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}
