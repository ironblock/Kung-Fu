import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians from looking straight down (0)
 * toward the horizon. Yaw, radius and centre are left unchanged.
 *
 * `limits.pitchDisabledRadiusScale` forces the effective pitch maximum down to
 * `pitchMin` as the camera zooms out, so at the default fully-zoomed-out radius
 * any requested tilt would be clamped to looking straight down. It is cleared
 * here so the tilt holds at every zoom level, including later zoom changes.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
