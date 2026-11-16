import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * The camera's radius (zoom), yaw (heading) and center are left unchanged.
 *
 * By default the library limits pitch by the camera's distance from the globe
 * (from 2 * planetRadius outward pitch is forced to pitchMin, and a new camera
 * starts at 4 * planetRadius). Setting `pitchDisabledRadiusScale` to null
 * removes that restriction at every radius, so the tilt holds when the camera
 * later moves nearer to or farther from the globe.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    if (pitch < limits.pitchMin || pitch > limits.pitchMax) {
        throw new RangeError(
            `pitch ${pitch} is outside the camera's pitch range [${limits.pitchMin}, ${limits.pitchMax}]`,
        );
    }

    // Allow full pitch at any radius. Applies on the next pitch write that
    // changes the value.
    limits.pitchDisabledRadiusScale = null;

    // Write pitch only. Pitch is clamped against the current radius, which is
    // kept as is, and the center is not touched, so zoom, heading and the
    // centre point do not change.
    camera.pitch = pitch;

    // Confirm the library actually stored the requested tilt.
    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `camera pitch is ${camera.pitch} after setting ${pitch}; the library clamped it`,
        );
    }
}
