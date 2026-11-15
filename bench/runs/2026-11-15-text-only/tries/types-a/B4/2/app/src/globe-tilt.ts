import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a GeospatialCamera to `pitch` radians, where 0 is looking straight down
 * at the globe and pi/2 is the horizon. Zoom (radius), heading (yaw) and the
 * centre point are left unchanged.
 *
 * By default the library lowers the maximum allowed pitch as the camera zooms
 * out (`limits.pitchDisabledRadiusScale`), and a new camera starts fully zoomed
 * out, where that maximum is pitchMin (straight down). Setting the scale to
 * `null` removes the radius dependency, so the tilt holds at every zoom level,
 * including when the app later moves the camera nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const limits = camera.limits;

  // Pitch must not depend on radius, otherwise zooming out re-clamps it to 0.
  limits.pitchDisabledRadiusScale = null;

  // Make sure the requested pitch lies inside the configured pitch range.
  if (limits.pitchMax < pitch) {
    limits.pitchMax = pitch;
  }
  if (limits.pitchMin > pitch) {
    limits.pitchMin = pitch;
  }

  // Pitch-only update: omitted fields (yaw, radius, center) keep their values.
  setGeospatialOrientation(camera, { pitch });
}
