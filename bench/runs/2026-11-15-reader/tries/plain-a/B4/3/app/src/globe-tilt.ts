import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = looking straight down
 * at the ground, larger = toward the horizon) without changing its zoom (radius),
 * heading (yaw) or centre point.
 *
 * The library caps the pitch according to the current radius
 * (`limits.pitchDisabledRadiusScale`): beyond 2× the planet radius the cap falls
 * off, and at 4× (the fully zoomed-out start pose) it is effectively 0. Every
 * orientation change re-applies that cap, so a plain pitch assignment would be
 * silently undone. This function therefore sets `pitchDisabledRadiusScale` to
 * `null`, which removes the radius-dependent cap for this camera. The camera
 * keeps the requested tilt when it is later zoomed in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
