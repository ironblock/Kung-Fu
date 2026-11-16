import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = straight down,
 * larger = toward the horizon) while keeping its yaw (heading), radius (zoom)
 * and centre point unchanged.
 *
 * The library caps pitch by a radius-dependent limit (getEffectivePitchMax),
 * which at the default fully-zoomed-out radius is effectively 0. So the pitch
 * cap is raised to the requested tilt first, and the radius-dependent scaling
 * that would lower it is turned off. This makes the tilt survive later zoom
 * changes as well.
 *
 * Note: this changes `limits.pitchMax` and `limits.pitchDisabledRadiusScale`
 * on the camera. Those limits are not restored.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Keep the current orientation so it can be restored exactly.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Lift the cap so the requested pitch is not clamped.
    camera.limits.pitchDisabledRadiusScale = null;
    camera.limits.pitchMax = Math.max(camera.limits.pitchMax, pitch);

    // Write radius first (pitch is clamped against the radius in effect at write time),
    // then yaw and pitch, then re-assign the centre (a Vec3 assignment copies and re-orbits).
    camera.radius = radius;
    camera.yaw = yaw;
    camera.pitch = pitch;
    camera.center = center;
}
