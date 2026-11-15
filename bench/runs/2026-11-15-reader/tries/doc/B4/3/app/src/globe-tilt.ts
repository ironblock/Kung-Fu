import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians (0 = straight down, toward the
 * horizon as pitch grows) without changing its zoom, heading or centre point.
 *
 * The library fades the allowed pitch down to `pitchMin` as the camera zooms out
 * (`pitchDisabledRadiusScale`, default {x: 2, y: 4}). A new camera rests at
 * `radiusMax` (4 planet radii), where that fade has already reached `pitchMin`, so a
 * plain `pitch` assignment would be clamped to ~0. Setting the scale to `null` turns
 * the fade off ("full pitch at every radius"), so the tilt holds at any zoom, including
 * when the app later moves the camera nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
