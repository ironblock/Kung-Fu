import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const t = camera.target;
  t.x = point.x;
  t.y = point.y;
  t.z = point.z;

  // A target write alone does not invalidate the cached view/world matrices
  // (note 3).  Nudging alpha to a different value forces a rebuild that
  // incorporates the new target; restoring it immediately gives the correct
  // final pose.  Both writes happen synchronously before any render, so the
  // intermediate state is never drawn.
  const a = camera.alpha;
  camera.alpha = a + 1e-6;
  camera.alpha = a;
}
