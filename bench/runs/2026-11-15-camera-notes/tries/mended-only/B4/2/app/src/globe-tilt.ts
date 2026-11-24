import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the tilt of a geospatial globe camera without changing its zoom (radius),
 * heading (yaw) or centre point.
 *
 * `pitch` is in radians: 0 looks straight down at the ground, larger values
 * tilt toward the horizon.
 *
 * By default the camera clamps pitch against its radius (from 4R it is forced
 * to 0.001), so a pitch write made while zoomed out would be lost. We turn that
 * radius-based clamp off with `pitchDisabledRadiusScale = null`, which lets the
 * pitch hold at any zoom, including later when the app moves the camera.
 * The limit change only applies on the next write that changes a value, so the
 * centre is reassigned (same value, no movement) to make it take effect now.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    camera.limits.pitchDisabledRadiusScale = null;
    camera.center = camera.center; // make the limit change apply now
    camera.pitch = pitch;
}
