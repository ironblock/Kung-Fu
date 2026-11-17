import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

const flightTokens = new WeakMap<GeospatialCamera, number>();

const TWO_PI = Math.PI * 2;
const ANGLE_TOLERANCE = 1e-4;
const ABSOLUTE_TOLERANCE = 1e-4;
const RELATIVE_TOLERANCE = 1e-6;

function isValidPlace(place: Place): boolean {
  return (
    Number.isFinite(place.yaw) &&
    Number.isFinite(place.pitch) &&
    Number.isFinite(place.radius) &&
    Number.isFinite(place.center.x) &&
    Number.isFinite(place.center.y) &&
    Number.isFinite(place.center.z)
  );
}

function copyCenter(center: Place["center"]) {
  return { x: center.x, y: center.y, z: center.z };
}

function wrapPi(value: number): number {
  let wrapped = value % TWO_PI;
  if (wrapped < -Math.PI) {
    wrapped += TWO_PI;
  } else if (wrapped >= Math.PI) {
    wrapped -= TWO_PI;
  }
  return wrapped;
}

function shortestAngleDelta(a: number, b: number): number {
  return Math.abs(wrapPi(a - b));
}

function isArrived(camera: GeospatialCamera, place: Place): boolean {
  const yawDelta = shortestAngleDelta(camera.yaw, place.yaw);
  const pitchDelta = shortestAngleDelta(camera.pitch, place.pitch);

  const radiusDelta = Math.abs(camera.radius - place.radius);
  const radiusScale = Math.max(Math.abs(camera.radius), Math.abs(place.radius), 1);
  const radiusTolerance = Math.max(ABSOLUTE_TOLERANCE, RELATIVE_TOLERANCE * radiusScale);

  const centerDelta = Math.hypot(
    camera.center.x - place.center.x,
    camera.center.y - place.center.y,
    camera.center.z - place.center.z
  );
  const centerScale = Math.max(
    Math.hypot(camera.center.x, camera.center.y, camera.center.z),
    Math.hypot(place.center.x, place.center.y, place.center.z),
    radiusScale,
    1
  );
  const centerTolerance = Math.max(ABSOLUTE_TOLERANCE, RELATIVE_TOLERANCE * centerScale);

  return (
    yawDelta <= ANGLE_TOLERANCE &&
    pitchDelta <= ANGLE_TOLERANCE &&
    radiusDelta <= radiusTolerance &&
    centerDelta <= centerTolerance
  );
}

function cancelCurrentFly(camera: GeospatialCamera): void {
  try {
    camera._cancelFly?.();
  } catch {
    // The library does not promise that _cancelFly always exists or never throws.
  }
}

export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  if (!camera || !scene || !place || !place.center) {
    return false;
  }

  if (!isValidPlace(place)) {
    return false;
  }

  const token = (flightTokens.get(camera) ?? 0) + 1;
  flightTokens.set(camera, token);

  try {
    // Make sure any in-progress fly-to on this camera is stopped before starting ours.
    cancelCurrentFly(camera);

    const center = copyCenter(place.center);

    // No meaningful animation length: set the orientation immediately and treat it as arrived.
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      setGeospatialOrientation(camera, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center,
      });
      return true;
    }

    // If we are already there, stop any other fly-to and report success.
    if (isArrived(camera, place)) {
      return true;
    }

    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center,
      durationMs,
    });

    // If another flyToPlace() call took ownership of this camera, our flight was not the one that completed.
    if (flightTokens.get(camera) !== token) {
      return false;
    }

    // flyGeospatialCameraToAsync resolves early when cancelled by a newer flight or control input.
    // It does not expose whether it completed normally, so we infer success from the final pose.
    return isArrived(camera, place);
  } catch {
    return false;
  }
}
