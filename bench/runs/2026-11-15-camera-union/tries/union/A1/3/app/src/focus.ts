import type { ArcRotateCamera } from "@babylonjs/lite";

// Relative size of the probe write used to make the camera register the new target.
const NUDGE = 1e-9;

/**
 * Makes the arc-rotate camera orbit `point`, keeping its alpha, beta and radius.
 * The camera moves by the same offset as from the old target to `point`, and
 * it looks straight at `point`. The view is up to date when this returns.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Pan momentum would move the target away from `point` on the next frame.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // Write the target in place. A new target object is not noticed by the library,
  // and target changes only show up on the next alpha/beta/radius write that
  // changes its value.
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Write radius to a slightly different value and back. Each write that changes
  // the value marks the camera dirty, so the new target is used right away. The
  // radius ends up exactly as it was. The probe stays inside the radius limits.
  const r = camera.radius;
  const step = NUDGE * Math.max(1, Math.abs(r));
  const lo = camera.lowerRadiusLimit ?? -Infinity;
  const hi = camera.upperRadiusLimit ?? Infinity;
  let probe = r + step;
  if (probe > hi) probe = r - step;
  if (probe >= lo && probe <= hi && probe !== r) {
    camera.radius = probe;
    camera.radius = r;
  }
}
