import type { GeospatialCamera } from "@babylonjs/lite";
import { getEffectivePitchMax, setGeospatialOrientation } from "@babylonjs/lite";

const PITCH_TOLERANCE = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` (radians; 0 = looking straight
 * down at the ground, larger = toward the horizon) while keeping its yaw,
 * radius (zoom) and center unchanged.
 *
 * The pitch limits are widened so that the requested tilt is not clamped at
 * the current zoom, and the radius-dependent pitch cap is disabled so the tilt
 * still holds when the camera is later moved nearer to or farther from the globe.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    // Remember the values that must not change.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { ...camera.center };

    // Widen the pitch limits so the requested pitch is allowed, and remove the
    // radius-dependent pitch cap so the tilt survives zoom changes.
    const limits = camera.limits;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchDisabledRadiusScale = null;

    if (getEffectivePitchMax(limits, radius) + PITCH_TOLERANCE < pitch) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} rad exceeds the effective pitch limit at radius ${radius}`,
        );
    }

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    // Verify the library did not clamp or move anything else.
    if (Math.abs(camera.pitch - pitch) > PITCH_TOLERANCE) {
        throw new Error(
            `tiltGlobeCamera: requested pitch ${pitch} rad but camera is at ${camera.pitch} rad`,
        );
    }
    if (Math.abs(camera.radius - radius) > PITCH_TOLERANCE) {
        throw new Error("tiltGlobeCamera: zoom (radius) changed while tilting");
    }
    if (
        Math.abs(camera.center.x - center.x) > PITCH_TOLERANCE ||
        Math.abs(camera.center.y - center.y) > PITCH_TOLERANCE ||
        Math.abs(camera.center.z - center.z) > PITCH_TOLERANCE
    ) {
        throw new Error("tiltGlobeCamera: center changed while tilting");
    }
}
