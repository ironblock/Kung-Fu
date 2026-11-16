import type { GeospatialCamera } from "@babylonjs/lite";
import { getEffectivePitchMax, setGeospatialOrientation } from "@babylonjs/lite";

const EPSILON = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon.
 *
 * Zoom (radius), heading (yaw) and centre are kept as they are. The pitch
 * limits are widened where needed so the tilt is not clamped at the current
 * zoom or at either zoom extreme, which means later zoom changes keep the tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    if (limits.pitchMin > pitch) limits.pitchMin = pitch;
    if (limits.pitchMax < pitch) limits.pitchMax = pitch;

    // The effective pitch maximum depends on the radius, so check it at the
    // current zoom and at both zoom extremes.
    const radii = [camera.radius, limits.radiusMin, limits.radiusMax];
    for (const radius of radii) {
        const allowed = getEffectivePitchMax(limits, radius);
        if (allowed + EPSILON < pitch) {
            throw new Error(
                `Pitch ${pitch} is still limited to ${allowed} at radius ${radius}; ` +
                    `check limits.pitchDisabledRadiusScale.`,
            );
        }
    }

    // Keep yaw, radius and centre exactly as they are; only the pitch changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: camera.center,
    });

    if (Math.abs(camera.pitch - pitch) > EPSILON) {
        throw new Error(
            `Camera pitch is ${camera.pitch} after tilting, expected ${pitch}; ` +
                `the tilt was clamped.`,
        );
    }
}
