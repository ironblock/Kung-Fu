import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * Yaw, radius (zoom) and centre are not changed. The tilt is kept at any zoom:
 * the radius-dependent pitch limit is switched off and the pitch maximum is
 * raised to at least `pitch`, so later zoom changes do not clamp the tilt away.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    // A new camera sits at 4 * planetRadius, where the radius-dependent limit
    // has already collapsed to pitchMin (0.001). Any tilt written then would be
    // clamped to that, so remove the radius dependence and make room for `pitch`.
    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Only pitch is written: yaw, radius and centre are left exactly as they are.
    const radius = camera.radius;
    camera.pitch = pitch;

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} was clamped to ${camera.pitch}; ` +
                `check camera.limits (pitchMin ${limits.pitchMin}, pitchMax ${limits.pitchMax})`,
        );
    }
    if (camera.radius !== radius) {
        throw new Error("tiltGlobeCamera: radius changed while setting pitch");
    }
}
