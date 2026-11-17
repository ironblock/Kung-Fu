import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const ANGULAR_TOLERANCE = 1e-4;
const LENGTH_TOLERANCE = 1e-4;
const RELATIVE_TOLERANCE = 1e-9;
const TWO_PI = Math.PI * 2;

function wrapRadians(angle: number): number {
  if (!Number.isFinite(angle)) return NaN;
  let a = (angle + Math.PI) % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a - Math.PI;
}

function angularDistance(a: number, b: number): number {
  return Math.abs(wrapRadians(a - b));
}

function easeInOutCubic(g: number): number {
  const t = Math.min(1, Math.max(0, g));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function arrivedAtPlace(camera: GeospatialCamera, place: Place): boolean {
  if (!Number.isFinite(camera.yaw) || !Number.isFinite(place.yaw)) return false;
  if (angularDistance(camera.yaw, place.yaw) > ANGULAR_TOLERANCE) return false;

  if (!Number.isFinite(camera.pitch) || !Number.isFinite(place.pitch)) return false;
  if (Math.abs(camera.pitch - place.pitch) > ANGULAR_TOLERANCE) return false;

  if (!Number.isFinite(camera.radius) || !Number.isFinite(place.radius)) return false;
  const radiusTolerance = Math.max(LENGTH_TOLERANCE, Math.abs(place.radius) * RELATIVE_TOLERANCE);
  if (Math.abs(camera.radius - place.radius) > radiusTolerance) return false;

  const dx = camera.center.x - place.center.x;
  const dy = camera.center.y - place.center.y;
  const dz = camera.center.z - place.center.z;
  const centerMagnitude = Math.hypot(place.center.x, place.center.y, place.center.z);
  const centerTolerance = Math.max(LENGTH_TOLERANCE, centerMagnitude * RELATIVE_TOLERANCE);

  return Math.hypot(dx, dy, dz) <= centerTolerance;
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 1000;

  return flyGeospatialCameraToAsync(camera, scene, {
    yaw: place.yaw,
    pitch: place.pitch,
    radius: place.radius,
    center: {
      x: place.center.x,
      y: place.center.y,
      z: place.center.z,
    },
    durationMs: duration,
    ease: easeInOutCubic,
  })
    .then(() => arrivedAtPlace(camera, place))
    .catch(() => false);
}
