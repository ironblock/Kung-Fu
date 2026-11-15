import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon (π/2).
 *
 * The library lowers the maximum pitch as the camera zooms out (see
 * `limits.pitchDisabledRadiusScale`), so a camera at its default, fully zoomed-out
 * radius would be forced to look straight down. Turning that feature off gives
 * full pitch range at every radius, so the tilt also survives later zoom changes.
 * Zoom, heading (yaw) and the centre point are left as they are.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    camera.pitch = pitch;
}
