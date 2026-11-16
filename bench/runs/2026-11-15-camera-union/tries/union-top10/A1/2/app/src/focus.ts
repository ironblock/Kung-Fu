import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`, keeping its alpha, beta and radius.
 *
 * The eye is target + radius * direction(alpha, beta), so moving the target by
 * (point - oldTarget) moves the eye by the same offset and leaves the view
 * direction pointing at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Write the target in place. Assigning a new object does not mark the camera dirty.
  camera.target.x = point.x;
  camera.target.y = point.y;
  camera.target.z = point.z;

  // An in-place target write is only picked up by the next alpha/beta/radius write that
  // changes the value (library notes, item 3). Force that now with a change-and-restore on
  // radius, so the position and view are current in this frame and the distance ends
  // exactly where it started.
  const radius = camera.radius;
  const eps = Math.max(Math.abs(radius), 1) * 1e-9;
  camera.radius = radius + eps;
  if (camera.radius === radius) {
    // The upper radius limit clamped the nudge away; nudge the other way instead.
    camera.radius = radius - eps;
  }
  camera.radius = radius;
}
