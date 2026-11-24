import type { ArcRotateCamera } from "@babylonjs/lite";

// Moves the orbit centre of an arc-rotate camera to `point`. alpha, beta and
// radius are kept, so the eye moves by the same offset as the centre and the
// camera looks straight at `point`.
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Write the components in place. Assigning a new target object does not mark
  // the camera dirty (camera-notes 3), and the controls read camera.target by reference.
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // The new target only takes effect on an alpha/beta/radius write that changes
  // the stored value (camera-notes 3). Force one with a radius nudge, restored at once.
  // The nudge goes in a direction that stays inside the upper radius limit, so it is not clamped.
  const r = camera.radius;
  const step = Math.max(Math.abs(r), 1) * 1e-9;
  const upper = camera.upperRadiusLimit;
  const nudged = upper === undefined || r + step <= upper ? r + step : r - step;
  camera.radius = nudged;
  camera.radius = r;
}
