import type { ArcRotateCamera } from "@babylonjs/lite";

// Size of the temporary alpha change used to make the camera recompute its pose.
// It is applied and undone within this one call, so it is never rendered.
const KICK = 1e-3;

/**
 * Makes the camera orbit `point`. Its alpha, beta and radius are kept, so it
 * moves by the same offset as from the old target to `point`, and it looks
 * at `point`.
 */
export function focusOn(
  camera: ArcRotateCamera,
  point: { x: number; y: number; z: number },
): void {
  // Write the target fields in place. Assigning a new target object does not
  // mark the camera dirty (camera-notes.md, item 2).
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // A target write alone does not show until an alpha/beta/radius write changes
  // the value. Make a real alpha change, then restore the exact original, so the
  // camera's pose is updated at once and the angle comes back unchanged.
  const alpha = camera.alpha;
  camera.alpha = alpha + KICK;
  if (camera.alpha === alpha) {
    // The upper limit clamped the kick to the same value; try the other way.
    camera.alpha = alpha - KICK;
  }
  camera.alpha = alpha;
}
