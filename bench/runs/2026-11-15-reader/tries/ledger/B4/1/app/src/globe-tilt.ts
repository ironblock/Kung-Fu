import { setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a globe camera to `pitch` (radians; 0 = looking straight down at the globe,
 * toward the horizon as it grows) without changing its zoom, heading or centre.
 *
 * By default the camera's limits flatten pitch as it zooms out: at `pitchDisabledRadiusScale`
 * the maximum pitch falls to `pitchMin`, so a new camera (which starts fully zoomed out)
 * would clamp any tilt to about 0.001. This function therefore sets
 * `camera.limits.pitchDisabledRadiusScale` to `null` for this camera, which keeps the full
 * pitch range at every radius. Later zooms then keep the tilt. The side effect is that the
 * automatic flattening when zoomed out no longer happens for this camera.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    if (!Number.isFinite(pitch) || pitch < limits.pitchMin || pitch > limits.pitchMax) {
        throw new RangeError(`pitch must be in [${limits.pitchMin}, ${limits.pitchMax}], got ${pitch}`);
    }
    // Limits are read only when the orientation is recomputed, so set them before the call below.
    limits.pitchDisabledRadiusScale = null;
    // Always recomputes (no equality shortcut), keeping the current yaw, radius and centre.
    setGeospatialOrientation(camera, { pitch });
}
