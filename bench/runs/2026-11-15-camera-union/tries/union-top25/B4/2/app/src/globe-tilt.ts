import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-9;

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = straight down,
 * larger = toward the horizon) while keeping its radius (zoom), yaw (heading)
 * and center unchanged.
 *
 * The library clamps pitch against the radius it is applied with: at 4R the
 * pitch limit is effectively 0, falling linearly from 2R. So when the camera is
 * further out than 2R, the pitch is applied while the radius is temporarily
 * lowered to 2R, then the original radius is restored.
 *
 * Throws if the pitch cannot be held at the original radius, rather than
 * leaving the camera silently at a different tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const originalRadius = camera.radius;
    const { planetRadius, radiusMin, radiusMax } = camera.limits;

    // Pitch is unclamped at or below 2R, so use 2R as the working radius.
    const workingRadius = Math.min(Math.max(2 * planetRadius, radiusMin), radiusMax);
    const needsTemporaryRadius = originalRadius > workingRadius;

    if (needsTemporaryRadius) {
        camera.radius = workingRadius;
    }
    try {
        camera.pitch = pitch;
        if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
            throw new RangeError(
                `tiltGlobeCamera: pitch ${pitch} exceeds the limit ${camera.pitch} at radius ${workingRadius}`,
            );
        }
    } finally {
        if (needsTemporaryRadius) {
            camera.radius = originalRadius;
        }
    }

    if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
        throw new Error(
            `tiltGlobeCamera: pitch was reset to ${camera.pitch} when radius ${originalRadius} was restored; ` +
                `pitch ${pitch} cannot be held at this zoom`,
        );
    }
}
