import type { ArcRotateCamera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix } from "@babylonjs/lite";

type Vec3Like = {
  x: number;
  y: number;
  z: number;
  set?: (x: number, y: number, z: number) => Vec3Like | undefined;
  copyFrom?: (source: { x: number; y: number; z: number }) => Vec3Like | undefined;
};

type CameraCacheVersionFields = {
  _viewVer?: number | undefined;
  _vpVer?: number | undefined;
};

function copyPointIntoVec(target: Vec3Like, point: { x: number; y: number; z: number }): Vec3Like {
  if (typeof target.set === "function") {
    const result = target.set(point.x, point.y, point.z);
    return result ?? target;
  }

  if (typeof target.copyFrom === "function") {
    const result = target.copyFrom(point);
    return result ?? target;
  }

  target.x = point.x;
  target.y = point.y;
  target.z = point.z;
  return target;
}

function invalidateMatrixCaches(camera: ArcRotateCamera): void {
  const caches = camera as unknown as CameraCacheVersionFields;
  caches._viewVer = undefined;
  caches._vpVer = undefined;
}

function refreshCameraSynchronously(camera: ArcRotateCamera): void {
  invalidateMatrixCaches(camera);

  // Force the library's lazy position/view caches to rebuild before this call
  // returns, so same-frame label code sees the new target immediately.
  void getCameraPosition(camera);
  void getViewMatrix(camera);

  // Also touch the world matrix provider fields in case the label code reads
  // the camera directly instead of using the helper functions.
  void camera.worldMatrix;
  void camera.worldMatrixVersion;
}

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = copyPointIntoVec(camera.target as unknown as Vec3Like, point);

  // Assigning the same vector back gives a target setter a chance to update
  // dependent state while preserving the existing target identity when possible.
  camera.target = target as ArcRotateCamera["target"];

  // Pending panning inertia would immediately drag the camera away from the new
  // orbit centre, so freeze panning while leaving angle/radius inertia alone.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  refreshCameraSynchronously(camera);
}
