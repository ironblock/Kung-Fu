import type { ArcRotateCamera } from "@babylonjs/lite";

// Size of the temporary alpha change used to make the camera pick up the new
// target at once. Camera.target is not tracked, so only an alpha/beta/radius
// write that changes its value marks the camera dirty (see camera-notes.md, note 3).
const DIRTY_STEP = 1e-3;

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * The target is moved to `point` in place (the same object is kept), so the
 * camera moves by the same offset as from the old target to `point`. Its
 * alpha, beta and radius are unchanged, so it keeps its angles and distance
 * and looks straight at `point`. The change is visible immediately.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Pending right-drag panning would move the target away from `point`
  // on the next frame, so drop it.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // Force the camera to pick up the new target now. A write only counts when
  // the value changes, so nudge alpha away and back. If alpha is at a limit
  // and the nudge is clamped back to the same value, nudge the other way.
  const alpha = camera.alpha;
  camera.alpha = alpha + DIRTY_STEP;
  if (camera.alpha === alpha) {
    camera.alpha = alpha - DIRTY_STEP;
  }
  camera.alpha = alpha;
}
