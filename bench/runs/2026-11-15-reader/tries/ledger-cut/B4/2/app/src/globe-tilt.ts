import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon (pi/2). Yaw, radius and centre are kept.
 *
 * The library caps pitch by zoom: `getEffectivePitchMax` falls from `pitchMax` at
 * 2 planet radii to `pitchMin` (about 0) at 4 planet radii, and every orientation
 * change clamps to that cap. A newly created camera rests at 4 planet radii, so a
 * plain pitch write would be pulled back to straight down. Setting
 * `pitchDisabledRadiusScale` to `null` (the library's documented "full pitch at every
 * radius") removes that cap, so the tilt also holds when the camera later zooms in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
