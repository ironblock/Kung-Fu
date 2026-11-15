import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` (radians, 0 = straight down at the
 * ground, larger = toward the horizon) while keeping its zoom (radius), heading
 * (yaw) and centre point.
 *
 * The library caps pitch by radius through `limits.pitchDisabledRadiusScale`:
 * full pitch up to 2R, pitch forced to ~0 from 4R outward. A new camera rests at
 * 4R, so a plain pitch write would be clamped to ~0. The scale is therefore set
 * to `null` (full pitch at every radius), which also keeps the tilt when the app
 * later zooms in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
