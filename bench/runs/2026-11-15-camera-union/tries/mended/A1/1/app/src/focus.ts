import type { ArcRotateCamera } from "@babylonjs/lite";

// Small enough not to matter visually, large enough to count as a change.
// It is set and restored within this one call, so the camera's angles end up exactly as they were.
const NUDGE = 1e-3;

/**
 * Makes an arc-rotate camera orbit `point`.
 *
 * The camera's position is the target plus an offset set by alpha, beta and radius, so moving the
 * target moves the camera by the same amount. Angles and radius are kept, and the camera looks at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Edit the existing target in place. Assigning a new object would not mark the camera dirty (notes item 5).
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // An in-place target edit only shows up once alpha, beta or radius changes (notes item 5).
  // Change alpha and put it back so the matrix is rebuilt now, within this call.
  // If alpha is sitting on a limit, the first nudge is clamped away, so try the other way.
  const alpha = camera.alpha;
  camera.alpha = alpha + NUDGE;
  if (camera.alpha === alpha) {
    camera.alpha = alpha - NUDGE;
  }
  camera.alpha = alpha;
}
