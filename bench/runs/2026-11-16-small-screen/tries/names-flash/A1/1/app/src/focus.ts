import type { ArcRotateCamera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix } from "@babylonjs/lite";

type Point = { x: number; y: number; z: number };

type CameraCacheVersions = {
  _viewVer?: number | undefined;
  _vpVer?: number | undefined;
};

export function focusOn(camera: ArcRotateCamera, point: Point): void {
  const x = point.x;
  const y = point.y;
  const z = point.z;

  // The orbit centre is the camera target. Write into the existing vector so
  // controls that keep a reference to `camera.target` continue to work.
  const target = camera.target as Point;
  target.x = x;
  target.y = y;
  target.z = z;

  // Stop leftover pan inertia so the new centre is not immediately dragged away.
  // Angles and radius are intentionally left unchanged.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // Invalidate cached matrices so reads in this same frame see the new centre.
  const cache = camera as unknown as CameraCacheVersions;
  cache._viewVer = undefined;
  cache._vpVer = undefined;

  // Force the exported position/view getters to refresh synchronously before
  // returning, so immediate label updates are correct.
  void getCameraPosition(camera);
  void getViewMatrix(camera);
}
