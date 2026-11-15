import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians (0 = straight down, toward the
 * horizon as it grows) while keeping its zoom (radius), heading (yaw) and centre.
 *
 * The library fades the allowed pitch toward 0 as the camera zooms out
 * (`pitchDisabledRadiusScale`, default `{ x: 2, y: 4 }`). A new camera rests at
 * `radiusMax` (4 planet radii), where that fade forces pitch to `pitchMin`, and any
 * later zoom-out would also clamp the stored pitch away. To keep the tilt at every
 * zoom, the fade is turned off on this camera: pitch is then only bounded by
 * `limits.pitchMin` / `limits.pitchMax`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    // Only pitch is supplied, so yaw, radius and centre keep their current values.
    setGeospatialOrientation(camera, { pitch });
}
