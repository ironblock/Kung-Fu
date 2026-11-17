import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const EPS = 1e-4;

function approx(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS;
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
  })
    .then(() => {
      return (
        approx(camera.yaw, place.yaw) &&
        approx(camera.pitch, place.pitch) &&
        approx(camera.radius, place.radius) &&
        approx(camera.center.x, place.center.x) &&
        approx(camera.center.y, place.center.y) &&
        approx(camera.center.z, place.center.z)
      );
    })
    .catch(() => false);
}
