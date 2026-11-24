import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the orbit camera orbit `point` instead of its current target.
 *
 * The camera's position is derived from target + (alpha, beta, radius), so
 * changing the target by an offset moves the camera by that same offset, and
 * the camera then looks straight at `point`. Angles and radius are untouched.
 *
 * Notes on the library behaviour this relies on (camera-notes.md):
 * - Assigning a new object to `target` marks nothing dirty, so the target is
 *   edited in place. The same object is kept, so later angle/distance changes
 *   still orbit `point`.
 * - In-place target edits do not dirty the cached matrix by themselves, so
 *   radius is nudged away and back to force a rebuild now (same frame).
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  const radius = camera.radius;
  const step = Math.max(Math.abs(radius), 1) * 1e-9;
  const lower = camera.lowerRadiusLimit ?? -Infinity;
  const upper = camera.upperRadiusLimit ?? Infinity;

  // Pick a nearby radius inside the limits so the write is not clamped back to `radius`.
  let probe = radius - step;
  if (probe < lower) probe = radius + step;
  if (probe >= lower && probe <= upper && probe !== radius) {
    camera.radius = probe;
    camera.radius = radius; // exact original distance, marks the matrix dirty
  }
}
