import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon.
 *
 * The camera keeps its yaw (heading), radius (zoom) and center. Only the pitch
 * changes, and the camera ends up looking at its center at that tilt.
 *
 * The library's default `pitchDisabledRadiusScale` forces pitch to its minimum
 * whenever the camera is far from the planet (radius >= 4 * planetRadius), and
 * a newly created camera starts exactly there. Such a rule would undo the tilt
 * as soon as the camera is zoomed out, so it is removed here. Pitch is still
 * bounded by `limits.pitchMin` and `limits.pitchMax`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;

    // Stop any running flight so it cannot overwrite the new orientation.
    camera._cancelFly?.();

    // Write everything in one call so the clamp sees the final values.
    // Copy the center: camera.center returns the camera's own object.
    const center = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: center.x, y: center.y, z: center.z },
    });
}
