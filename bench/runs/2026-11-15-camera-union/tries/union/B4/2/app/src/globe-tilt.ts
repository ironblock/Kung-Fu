import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the tilt of a geospatial globe camera.
 *
 * `pitch` is in radians: 0 looks straight down at the ground, larger values
 * tilt toward the horizon. Yaw, radius (zoom) and center are not changed.
 *
 * By default the library forces pitch down to about 0.001 whenever the camera
 * is at or above a certain distance from the planet, and the starting radius
 * is 4 * planetRadius, so a plain `camera.pitch = pitch` would be lost. Setting
 * `pitchDisabledRadiusScale` to null removes that radius-dependent restriction,
 * so the tilt holds at any zoom, including when the app later moves the camera
 * nearer or farther. The limits are changed before the pitch is written,
 * because the new limits only take effect on the next pitch/yaw/radius write.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  camera.limits.pitchDisabledRadiusScale = null;
  camera.pitch = pitch;
}
