import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const t = camera.target;
  t.x = point.x;
  t.y = point.y;
  t.z = point.z;

  // Per the library notes, a target change only becomes visible at the next
  // alpha/beta/radius write that actually changes the value (same-value
  // writes are ignored).  We perform such a write and immediately undo it so
  // the view matrix is rebuilt within this same frame.
  const a = camera.alpha;
  camera.alpha = a + 1;
  if (camera.alpha !== a) {
    camera.alpha = a;
    return;
  }
  const b = camera.beta;
  camera.beta = b + 1;
  if (camera.beta !== b) {
    camera.beta = b;
    return;
  }
  const r = camera.radius;
  camera.radius = r + 1;
  camera.radius = r;
}
