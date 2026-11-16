import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Yaw, radius and centre are kept.
 *
 * The library caps pitch against the camera's radius (from 4 planet radii the
 * cap is 0.001), so a camera at its default fully-zoomed-out start radius could
 * not be tilted at all. This function lifts that radius-dependent cap so the
 * tilt holds at any zoom, including when the app later moves the camera.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number >= 0, got ${pitch}`);
    }

    const { limits } = camera;
    const yaw = camera.yaw;
    const radius = camera.radius;

    // Remove the radius-dependent pitch reduction and make sure the static
    // maximum allows the requested tilt.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Apply the orientation with the current radius so the zoom is unchanged.
    setGeospatialOrientation(camera, {
        yaw,
        pitch,
        radius,
        center: camera.center,
    });

    // Fail loudly rather than leave the camera at a silently clamped tilt.
    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}; the library clamped it`,
        );
    }
}
