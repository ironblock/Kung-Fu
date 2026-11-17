import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const EPSILON = 0.001;

function wrapToPi(value: number): number {
  const twoPi = Math.PI * 2;
  let result = (value + Math.PI) % twoPi;
  if (result < 0) result += twoPi;
  return result - Math.PI;
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  return (
    Math.abs(wrapToPi(camera.yaw - place.yaw)) <= EPSILON &&
    close(camera.pitch, place.pitch) &&
    close(camera.radius, place.radius) &&
    close(camera.center.x, place.center.x) &&
    close(camera.center.y, place.center.y) &&
    close(camera.center.z, place.center.z)
  );
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  const ms = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 1000;

  const options = {
    yaw: place.yaw,
    pitch: place.pitch,
    radius: place.radius,
    center: {
      x: place.center.x,
      y: place.center.y,
      z: place.center.z,
    },
    durationMs: ms,
  };

  return flyGeospatialCameraToAsync(camera, scene, options)
    .then(() => isAtPlace(camera, place))
    .catch(() => false);
}
