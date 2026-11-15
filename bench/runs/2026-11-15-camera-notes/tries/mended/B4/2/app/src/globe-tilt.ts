import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * The camera's pitch is normally capped by its current radius, which forces
 * the pitch to near 0 when zoomed far out (a new camera starts at 4R). Turning
 * off that radius coupling lets the requested tilt hold at any zoom. Zoom,
 * heading (yaw) and centre are left unchanged.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Disable the radius-dependent pitch cap. Full pitch is then allowed at any radius,
    // so later zoom changes will not pull the tilt back down.
    camera.limits.pitchDisabledRadiusScale = null;

    // Assigning a new centre object applies the limits change (same values, so the eye does not move).
    const c = camera.center;
    camera.center = { x: c.x, y: c.y, z: c.z };

    // Write the pitch only. Yaw, radius and centre are not touched.
    camera.pitch = pitch;
}
