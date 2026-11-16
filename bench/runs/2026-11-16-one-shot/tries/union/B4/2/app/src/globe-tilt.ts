import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the pitch of a geospatial camera (radians from looking straight down, 0,
 * toward the horizon) while keeping its yaw, radius and centre unchanged.
 *
 * By default a GeospatialCamera clamps pitch against its radius: at
 * radius >= 4 * planetRadius (where a new camera starts) pitch is forced to
 * about 0. Setting pitchDisabledRadiusScale to null removes that radius-based
 * clamp, so the requested pitch holds at every zoom, including later moves.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;

    // Allow full pitch at any radius. This must be in place before the pitch write.
    limits.pitchDisabledRadiusScale = null;

    // Per the library notes, a change to limits is applied on the next write that
    // changes a value, or on any centre assignment. Re-assigning the same centre
    // object triggers that without moving the centre.
    camera.center = camera.center;

    const target = Math.min(Math.max(pitch, limits.pitchMin), limits.pitchMax);

    // Radius and yaw are not touched, so zoom and heading stay as they are.
    camera.pitch = target;

    if (Math.abs(camera.pitch - target) > 1e-6) {
        throw new Error(
            `tiltGlobeCamera: pitch ${target} was not applied (camera reads ${camera.pitch})`
        );
    }
}
