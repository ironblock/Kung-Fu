import type { ArcRotateCamera } from "@babylonjs/lite";

// Step used to force the camera to rebuild its matrices right away (camera-notes.md, note 5).
const REBUILD_NUDGE = 1e-7;

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * alpha, beta and radius are kept, so the camera moves by the same offset as
 * from the old target to `point`, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Edit target in place: assigning a new object to target does not mark the camera dirty.
  camera.target.x = point.x;
  camera.target.y = point.y;
  camera.target.z = point.z;

  // Pending pan inertia would keep moving target away from `point`, so drop it.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // The in-place target edit only shows once the matrices are rebuilt, which happens after an
  // alpha change. Nudge alpha away and back so the next read sees the new target. If the nudge
  // is clamped by a limit, try the other direction. The final alpha equals the original.
  const alpha = camera.alpha;
  camera.alpha = alpha + REBUILD_NUDGE;
  if (camera.alpha === alpha) {
    camera.alpha = alpha - REBUILD_NUDGE;
  }
  camera.alpha = alpha;
}
