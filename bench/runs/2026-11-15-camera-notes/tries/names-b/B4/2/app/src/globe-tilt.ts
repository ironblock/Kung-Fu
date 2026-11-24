import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-9;

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * Heading (yaw), zoom (radius) and centre point are kept as they are. The pitch
 * range in the camera's limits is widened so the tilt holds at every zoom
 * level, including the fully zoomed-out start state, and survives later zooming.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    throw new RangeError(`pitch must be a finite number, got ${pitch}`);
  }

  // An in-flight fly animation would otherwise overwrite the new pitch.
  camera._cancelFly?.();

  // The limits decide the pitch the camera may actually reach. Make sure the
  // requested pitch is inside the allowed range, and stop the radius-dependent
  // pitch restriction from lowering it when the camera is zoomed out.
  const limits = camera.limits;
  if (pitch < limits.pitchMin) {
    limits.pitchMin = pitch;
  }
  if (pitch > limits.pitchMax) {
    limits.pitchMax = pitch;
  }
  limits.pitchDisabledRadiusScale = null;

  // Keep the current heading, zoom and centre; only the pitch changes.
  const { x, y, z } = camera.center;
  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch,
    radius: camera.radius,
    center: { x, y, z },
  });

  if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
    throw new Error(
      `Camera pitch is ${camera.pitch}, expected ${pitch}; the library clamped the requested tilt.`,
    );
  }
}
