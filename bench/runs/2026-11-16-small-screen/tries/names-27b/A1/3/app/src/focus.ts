import type { ArcRotateCamera } from "@babylonjs/lite";
import { getViewMatrix } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target as unknown as {
    x: number;
    y: number;
    z: number;
    copyFrom?: (other: { x: number; y: number; z: number }) => void;
  };

  if (typeof target.copyFrom === "function") {
    target.copyFrom(point);
  } else {
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;
  }

  // Invalidate cached view matrices so same-frame reads see the new orbit centre.
  camera._viewVer = -1;
  camera._vpVer = -1;
  camera._projVer = -1;

  // Rebuild the view matrix now rather than waiting for the next camera tick.
  getViewMatrix(camera);
}
