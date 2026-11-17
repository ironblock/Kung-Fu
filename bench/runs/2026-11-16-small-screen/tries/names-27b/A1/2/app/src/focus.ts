import type { ArcRotateCamera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;
  camera.target = target;

  // Touch the lazy position/view caches so same-frame reads see the new centre.
  void getCameraPosition(camera);
  void getViewMatrix(camera);
}
