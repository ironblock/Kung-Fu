import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the tilt of a geospatial globe camera.
 *
 * `pitch` is in radians: 0 looks straight down at the ground, larger values
 * tilt toward the horizon. Yaw, radius (zoom) and centre are left unchanged.
 *
 * By default GeospatialCamera forces pitch down to ~0.001 at large radii
 * (from 4R, falling off toward 2R), so a pitch write at the start radius is
 * clamped away. Setting `limits.pitchDisabledRadiusScale` to `null` removes
 * that radius-based restriction, so the requested pitch holds at every zoom,
 * including when the app later moves the camera nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    camera.pitch = pitch;
}
