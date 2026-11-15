import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians (0 = straight down, toward the
 * horizon as it grows) while keeping its zoom (radius), heading (yaw) and centre point.
 *
 * By default the library fades the allowed pitch to `pitchMin` as the camera zooms out
 * past `pitchDisabledRadiusScale` (fully zoomed out, pitch is forced to straight down).
 * That would silently undo the tilt, including at a new camera's starting zoom. Setting
 * the scale to `null` removes the radius-based fade so the tilt holds at every zoom,
 * including when the app later moves the camera nearer or farther. Pitch is still
 * clamped to the library's `pitchMin`/`pitchMax`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    // The pitch setter re-orients using the current yaw, radius and centre, so only the tilt changes.
    camera.pitch = pitch;
}
