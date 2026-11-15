import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down at the
 * ground, toward π/2 = the horizon), keeping its zoom (radius), heading (yaw)
 * and centre point unchanged.
 *
 * The camera's limits clamp pitch on every orientation change, so the limits are
 * adjusted first:
 *  - `pitchDisabledRadiusScale` lowers the allowed pitch as the camera zooms out,
 *    down to `pitchMin` (straight down) when fully zoomed out. That is where a new
 *    camera starts, so the requested tilt would be silently thrown away there and
 *    lost again whenever the app zooms out later. Setting it to `null` allows the
 *    full pitch at every radius.
 *  - `pitchMin` / `pitchMax` are only ever widened, and only when they would
 *    exclude the requested pitch.
 *
 * Note: this changes `camera.limits` in place, so it also affects tilting done
 * through the camera controls, and any other camera that shares the same limits
 * object.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;

    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMin > pitch) limits.pitchMin = pitch;
    if (limits.pitchMax < pitch) limits.pitchMax = pitch;

    // Fields left out keep their current values: yaw, radius and centre stay as they are.
    setGeospatialOrientation(camera, { pitch });
}
