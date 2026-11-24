import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * Yaw, radius (zoom) and centre are kept as they are. The pitch limits are
 * widened if needed so the tilt is not clamped at the current zoom, and the
 * result is checked so a clamped pitch throws instead of failing silently.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    if (pitch > limits.pitchMax) {
        limits.pitchMax = pitch;
    }
    if (pitch < limits.pitchMin) {
        limits.pitchMin = pitch;
    }

    camera._setOrientation(camera.yaw, pitch, camera.radius, camera.center);

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: requested pitch ${pitch} was clamped to ${camera.pitch} at radius ${camera.radius}`,
        );
    }
}
