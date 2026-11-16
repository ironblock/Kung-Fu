import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * The library's pitch maximum depends on the current radius (zoom), so a
 * requested tilt can be clamped away when the camera is zoomed out. To make the
 * tilt stick at every zoom level, this widens the pitch limits to include the
 * requested value and disables the radius-dependent reduction. Yaw (heading),
 * radius (zoom) and center are left unchanged.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;

    // Allow the requested pitch at any radius.
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    // Stop the pitch maximum from shrinking as the camera zooms in or out.
    limits.pitchDisabledRadiusScale = null;

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: camera.center,
    });

    // Read back to confirm the pitch was actually applied.
    if (Math.abs(camera.pitch - pitch) > 1e-6) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} was clamped to ${camera.pitch}`,
        );
    }
}
