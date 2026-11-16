import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon. The zoom (radius),
 * heading (yaw) and centre point are left as they are.
 *
 * The camera's pitch limits are widened to include `pitch` and the
 * radius-based pitch cap is disabled, so the tilt is kept when the camera is
 * later zoomed nearer or farther.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    // Without this, the library clamps pitch against the radius (by default to
    // about 0.001 at radius >= 4 * planetRadius), which would undo the tilt.
    const limits = camera.limits;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchDisabledRadiusScale = null;

    // Set pitch together with the current radius, yaw and centre, so nothing
    // else moves. Pitch is applied against the radius passed in the same call.
    const c = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: c.x, y: c.y, z: c.z },
    });

    // Fail loudly rather than leave the camera at a different tilt than asked for.
    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}; a pitch limit is still clamping it`,
        );
    }
}
