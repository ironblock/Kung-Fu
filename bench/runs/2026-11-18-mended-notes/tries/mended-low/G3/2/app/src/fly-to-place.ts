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
    const EPS = 0.001;

    const norm = (a: number): number => {
      let r = a % (2 * Math.PI);
      if (r >= Math.PI) r -= 2 * Math.PI;
      if (r < -Math.PI) r += 2 * Math.PI;
      return r;
    };

    const yawOk = Math.abs(norm(camera.yaw) - norm(place.yaw)) < EPS;
    const pitchOk = Math.abs(norm(camera.pitch) - norm(place.pitch)) < EPS;
    const radiusOk = Math.abs(camera.radius - place.radius) < EPS;
    const centerOk =
      Math.abs(camera.center.x - place.center.x) < EPS &&
      Math.abs(camera.center.y - place.center.y) < EPS &&
      Math.abs(camera.center.z - place.center.z) < EPS;

    return yawOk && pitchOk && radiusOk && centerOk;
  });
}
