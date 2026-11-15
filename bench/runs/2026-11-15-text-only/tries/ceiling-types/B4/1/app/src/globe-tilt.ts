import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians (0 = looking straight down at the
 * ground, toward the horizon as it grows) without changing its zoom (radius),
 * heading (yaw) or centre point.
 *
 * The camera clamps pitch against its limits on every orientation change, and
 * by default `limits.pitchDisabledRadiusScale` forces pitch down to `pitchMin`
 * as the camera zooms out (a newly created camera starts fully zoomed out, so
 * it would look straight down no matter what pitch we asked for). To keep the
 * requested tilt at every zoom, now and on later zoom changes, we turn that
 * radius-dependent pitch limit off and make sure the static pitch range
 * includes the requested value, then apply the pitch alone.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;

    // Full pitch range at every radius, so zooming in or out never re-clamps the tilt.
    limits.pitchDisabledRadiusScale = null;

    // Widen the static pitch range only if it does not already allow this pitch.
    if (limits.pitchMin > pitch) limits.pitchMin = pitch;
    if (limits.pitchMax < pitch) limits.pitchMax = pitch;

    // Only pitch is supplied; yaw, radius and center keep their current values.
    setGeospatialOrientation(camera, { pitch });
}
