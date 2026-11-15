import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = straight down at the globe,
 * π/2 = horizon) while keeping its yaw, radius (zoom) and centre unchanged.
 *
 * The library's default limits fade the allowed pitch down to almost zero as the
 * camera zooms past 2× the planet radius, and a new camera starts at 4×. Without
 * this change the tilt would be clamped away immediately, and it would also drop
 * again when the app zooms out. Setting `pitchDisabledRadiusScale` to `null`
 * gives full pitch range at every zoom, so the tilt holds on later zoom changes.
 * This modifies `camera.limits` for this camera only.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    // The new limits are read on each orientation change, so this has to run
    // after the limits change. It recomputes position and view from the current
    // yaw, radius and centre, and only pitch is new.
    setGeospatialOrientation(camera, { pitch });
}
