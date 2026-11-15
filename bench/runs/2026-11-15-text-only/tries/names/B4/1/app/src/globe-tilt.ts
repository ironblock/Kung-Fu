import type { GeospatialCamera } from "@babylonjs/lite";
import {
    getEffectivePitchMax,
    normalizeRadians,
    setGeospatialOrientation,
} from "@babylonjs/lite";

const EPSILON = 1e-6;

/**
 * Tilts a geospatial camera to `pitch` radians while keeping its zoom (radius),
 * heading (yaw) and centre point unchanged.
 *
 * `pitch` is measured from looking straight down at the ground (0) toward the horizon.
 *
 * The camera's pitch limits are widened where needed so the requested tilt is not
 * clamped, at the current zoom or at any zoom the camera can later move to.
 * Throws if the tilt could not be applied.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    // A running fly animation would overwrite the pitch on its next frame.
    camera._cancelFly?.();

    const limits = camera.limits;

    // The radius-dependent pitch reduction would otherwise clamp the request when zoomed out.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Confirm the effective maximum allows this pitch at the zoom limits and at the current zoom.
    for (const radius of [limits.radiusMin, camera.radius, limits.radiusMax]) {
        const effectiveMax = getEffectivePitchMax(limits, radius);
        if (effectiveMax + EPSILON < pitch) {
            throw new Error(
                `tiltGlobeCamera: effective pitch max ${effectiveMax} at radius ${radius} is below requested pitch ${pitch}`,
            );
        }
    }

    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    // Verify the camera actually ended up where requested.
    const yawError = Math.abs(normalizeRadians(camera.yaw - yaw));
    const centerError =
        Math.abs(camera.center.x - center.x) +
        Math.abs(camera.center.y - center.y) +
        Math.abs(camera.center.z - center.z);
    if (
        Math.abs(camera.pitch - pitch) > EPSILON ||
        yawError > EPSILON ||
        Math.abs(camera.radius - radius) > EPSILON ||
        centerError > EPSILON
    ) {
        throw new Error(
            `tiltGlobeCamera: camera did not reach the requested orientation ` +
                `(pitch ${camera.pitch} vs ${pitch}, yaw ${camera.yaw} vs ${yaw}, radius ${camera.radius} vs ${radius})`,
        );
    }
}
