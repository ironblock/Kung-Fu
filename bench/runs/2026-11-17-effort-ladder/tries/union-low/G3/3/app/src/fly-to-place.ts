import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  return flyGeospatialCameraToAsync(camera, scene, {
    yaw: place.yaw,
    pitch: place.pitch,
    radius: place.radius,
    center: place.center,
    durationMs,
  }).then(() => {
    const EPS = 1e-4;

    let yawDiff = Math.abs(camera.yaw - place.yaw);
    if (yawDiff > Math.PI) {
      yawDiff = 2 * Math.PI - yawDiff;
    }

    return (
      yawDiff < EPS &&
      Math.abs(camera.pitch - place.pitch) < EPS &&
      Math.abs(camera.radius - place.radius) < EPS &&
      Math.abs(camera.center.x - place.center.x) < EPS &&
      Math.abs(camera.center.y - place.center.y) < EPS &&
      Math.abs(camera.center.z - place.center.z) < EPS
    );
  });
}
