import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down,
 * increasing toward the horizon) without changing its zoom (radius), heading
 * (yaw) or centre point.
 *
 * By default the camera's limits fade the allowed pitch out as the camera
 * zooms out (`limits.pitchDisabledRadiusScale`), so at the starting,
 * fully-zoomed-out radius any tilt would be clamped back toward 0, and a
 * tilt set when zoomed in would be pulled back when zooming out. We turn that
 * radius-dependent clamp off and make sure the requested pitch lies inside
 * the fixed pitch range, so the tilt holds at every zoom level.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;

    // Stop the pitch limit from depending on the zoom distance.
    limits.pitchDisabledRadiusScale = null;

    // Make sure the requested pitch is inside the allowed range.
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }

    // Change only the pitch; yaw, radius and center are left as they are.
    setGeospatialOrientation(camera, { pitch });
}
