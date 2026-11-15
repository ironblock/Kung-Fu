import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians (0 = straight down, π/2 = horizon),
 * keeping its yaw, radius (zoom) and centre unchanged.
 *
 * `limits.pitchDisabledRadiusScale` forces pitch down to `pitchMin` as the camera
 * zooms out, so a fully zoomed-out camera (the default for a new camera) would
 * discard the tilt. It is cleared here so the tilt holds at every zoom level,
 * including when the camera is later moved nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
