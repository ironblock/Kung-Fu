import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians (0 = straight down, toward the horizon at pi/2),
 * keeping its yaw, radius and centre point.
 *
 * The library fades the allowed pitch toward `pitchMin` as the radius grows past
 * `pitchDisabledRadiusScale.x * planetRadius`, and it re-clamps pitch on every orientation change.
 * A new camera rests fully zoomed out, where the allowed pitch is ~0, so a plain pitch write would
 * be lost. Disabling that fade (`null` = full pitch at every radius) makes the tilt hold at every zoom.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
