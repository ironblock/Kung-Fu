import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Set the geospatial camera's pitch (radians from looking straight down, 0,
 * toward the horizon) without changing its zoom (radius), heading (yaw) or
 * centre point.
 *
 * The camera's limits are adjusted so the requested tilt holds at any zoom:
 * - `pitchDisabledRadiusScale` is cleared to `null`. Otherwise the library
 *   forces pitch down toward `pitchMin` as the camera zooms out, so a tilt set
 *   while fully zoomed out (the default for a new camera) would be lost.
 * - `pitchMin` / `pitchMax` are widened only if they do not already include
 *   `pitch`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    // Only pitch is supplied, so yaw, radius and center keep their current values.
    setGeospatialOrientation(camera, { pitch });
}
