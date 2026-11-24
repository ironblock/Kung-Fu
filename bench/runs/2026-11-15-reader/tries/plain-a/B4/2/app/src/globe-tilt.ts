import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = straight down at the ground,
 * toward the horizon as it grows) while keeping its zoom, heading and centre point.
 *
 * The library lowers the allowed pitch as the camera zooms out (see
 * `limits.pitchDisabledRadiusScale`) and forces it to `pitchMin` beyond 4x the
 * planet radius. A new camera rests at that fully zoomed-out radius, so the
 * zoom-dependent limit is removed here. Without that, any requested tilt would be
 * clamped back to about 0 and would also reset as the app zooms.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
