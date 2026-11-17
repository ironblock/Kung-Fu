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
    const yawDiff = Math.abs(shortestAngleDiff(camera.yaw, place.yaw));
    const pitchDiff = Math.abs(camera.pitch - place.pitch);
    const radiusDiff = Math.abs(camera.radius - place.radius);
    const cx = Math.abs(camera.center.x - place.center.x);
    const cy = Math.abs(camera.center.y - place.center.y);
    const cz = Math.abs(camera.center.z - place.center.z);
    return (
      yawDiff < EPS &&
      pitchDiff < EPS &&
      radiusDiff < EPS &&
      cx < EPS &&
      cy < EPS &&
      cz < EPS
    );
  });
}

function shortestAngleDiff(a: number, b: number): number {
  let d = (a - b) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
}
