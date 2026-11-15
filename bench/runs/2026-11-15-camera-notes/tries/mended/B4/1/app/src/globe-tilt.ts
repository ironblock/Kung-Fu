import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Yaw (heading), radius (zoom) and
 * centre are kept as they are.
 *
 * The library caps pitch by a value that depends on the radius
 * (getEffectivePitchMax), and at the default fully-zoomed-out radius that cap
 * is effectively pitchMin. So the radius-dependent cap is removed from the
 * camera's limits; otherwise the tilt would be forced back down at the
 * default zoom, and again whenever the camera is zoomed out later.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number >= 0, got ${pitch}`);
    }

    const limits = camera.limits;
    // Remove the radius-dependent reduction of the pitch cap, and make sure the
    // flat cap allows the requested pitch.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Copy the centre so the call cannot alias the camera's own Vec3.
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Setting the orientation in one call keeps yaw, radius and centre exactly
    // as they are, and applies the new pitch.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center,
    });

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} was not applied (camera reads ${camera.pitch})`,
        );
    }
}
