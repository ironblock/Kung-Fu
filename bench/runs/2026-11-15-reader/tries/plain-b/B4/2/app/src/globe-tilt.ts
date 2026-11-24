import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon (π/2). Yaw, zoom (radius)
 * and centre point are left unchanged by this call.
 *
 * The library's default limits cap the allowed pitch by zoom distance: beyond
 * `2 × planetRadius` the cap shrinks, and at `4 × planetRadius` (where a new
 * camera starts) only `pitchMin` (about 0) is allowed. Clearing
 * `pitchDisabledRadiusScale` on this camera's limits removes that cap, so the
 * tilt holds at every distance, including when the camera is later moved
 * nearer to or farther from the globe. This is a change to the camera's own
 * limits object, not to the library.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
