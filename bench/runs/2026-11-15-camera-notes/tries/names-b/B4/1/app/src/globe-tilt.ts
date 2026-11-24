import type { GeospatialCamera } from "@babylonjs/lite";
import { getEffectivePitchMax, setGeospatialOrientation } from "@babylonjs/lite";

const EPSILON = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 is looking
 * straight down at the ground and larger values tilt toward the horizon.
 *
 * Yaw (heading), radius (zoom) and center are kept as they are. The pitch
 * limits are widened if needed so the tilt is allowed at the current zoom,
 * at the nearest and farthest zoom, and therefore at any zoom in between.
 * Throws if the camera does not end up at the requested pitch with its
 * radius and center unchanged.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`pitch must be a finite number >= 0, got ${pitch}`);
    }

    const limits = camera.limits;

    // Make sure the static pitch range includes the requested tilt.
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }

    // The effective pitch maximum can depend on radius, so check the zoom
    // extremes as well as the current zoom.
    for (const radius of [limits.radiusMin, limits.radiusMax, camera.radius]) {
        const allowed = getEffectivePitchMax(limits, radius);
        if (allowed + EPSILON < pitch) {
            throw new Error(
                `pitch ${pitch} is not allowed at radius ${radius} (effective max ${allowed})`,
            );
        }
    }

    const yaw = camera.yaw;
    const radius = camera.radius;
    const centerBefore = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    setGeospatialOrientation(camera, {
        yaw,
        pitch,
        radius,
        center: { x: centerBefore.x, y: centerBefore.y, z: centerBefore.z },
    });

    const center = camera.center;
    if (
        Math.abs(camera.pitch - pitch) > EPSILON ||
        Math.abs(camera.radius - radius) > EPSILON ||
        Math.abs(camera.yaw - yaw) > EPSILON ||
        Math.abs(center.x - centerBefore.x) > EPSILON ||
        Math.abs(center.y - centerBefore.y) > EPSILON ||
        Math.abs(center.z - centerBefore.z) > EPSILON
    ) {
        throw new Error(
            `tiltGlobeCamera: camera did not reach pitch ${pitch} (got ${camera.pitch}) ` +
                `with radius, yaw and center unchanged`,
        );
    }
}
