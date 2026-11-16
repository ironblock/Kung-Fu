import type { ArcRotateCamera } from "@babylonjs/lite";

// Small enough not to be visible, large enough to count as a real change.
const NUDGE = 1e-9;

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Move the orbit centre in place. alpha, beta and radius are untouched, so the
  // eye moves by the same offset as the centre does.
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Writing target does not mark the camera dirty. The next alpha/beta/radius
  // write that changes its value does. So write alpha to a different value and
  // back, in the same synchronous block. Both writes change the value, which
  // marks the camera dirty, and the final alpha is exactly the original.
  const alpha = camera.alpha;
  const upper = camera.upperAlphaLimit;
  const delta = upper !== undefined && alpha + NUDGE > upper ? -NUDGE : NUDGE;
  camera.alpha = alpha + delta;
  camera.alpha = alpha;
}
