import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_EPSILON = 1e-6;

/**
 * Tilts a geospatial globe camera to `pitch` (radians; 0 = looking straight
 * down at the ground, larger = toward the horizon) while keeping its zoom
 * (radius), heading (yaw) and centre point unchanged.
 *
 * The pitch limits are widened so the requested tilt is not clamped at the
 * current zoom, and so it stays valid when the camera is later moved nearer
 * or farther. Pitch-disabling by radius is turned off for the same reason.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchDisabledRadiusScale = null;

    // Re-apply the orientation with the existing yaw, radius and centre, so
    // only the pitch changes and the view is recomputed to look at the centre.
    const center = camera.center;
    camera._setOrientation(
        camera.yaw,
        pitch,
        camera.radius,
        { x: center.x, y: center.y, z: center.z },
    );

    if (Math.abs(camera.pitch - pitch) > PITCH_EPSILON) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch} after setting ${pitch}; the requested tilt was not applied`,
        );
    }
}
