import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  const check = camera.target;
  if (check.x !== point.x || check.y !== point.y || check.z !== point.z) {
    camera.target = { ...check, x: point.x, y: point.y, z: point.z };
  } else {
    camera.target = target;
  }

  // Re-write the same orbit parameters so the camera rebuilds its matrices in this frame.
  camera.alpha = camera.alpha;
  camera.beta = camera.beta;
  camera.radius = camera.radius;

  // Force cached view/view-projection matrices to be recomputed immediately.
  camera._viewVer = -1;
  camera._vpVer = -1;
}
