import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_EPSILON = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 is looking
 * straight down at the ground and larger values tilt toward the horizon.
 *
 * Yaw (heading), radius (zoom) and center (the look-at point) are left
 * unchanged. The camera's pitch limits are widened so that the requested
 * tilt is allowed at the current zoom and is not clamped when the camera is
 * later moved nearer to or farther from the globe.
 *
 * Throws if the camera does not hold the requested pitch afterwards.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    // Allow the requested tilt in the limits so it is not clamped away.
    const limits = camera.limits;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);

    // Set only the pitch; yaw, radius and center keep their current values.
    camera.pitch = pitch;

    if (Math.abs(camera.pitch - pitch) > PITCH_EPSILON) {
        throw new Error(
            `Globe camera pitch is ${camera.pitch}, expected ${pitch}; ` +
                `the library clamped it (check limits.pitchMax and the radius-dependent effective pitch limit).`,
        );
    }
}
