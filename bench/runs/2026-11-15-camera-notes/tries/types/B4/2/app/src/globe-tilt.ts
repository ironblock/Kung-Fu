import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a GeospatialCamera to `pitch` radians (0 = looking straight down at the
 * globe, π/2 = horizon) without changing its zoom (radius), heading (yaw) or
 * centre point.
 *
 * By default the library caps pitch as the camera zooms out
 * (`limits.pitchDisabledRadiusScale`), forcing it to `pitchMin` (straight down)
 * at full zoom-out. That cap would silently undo the tilt, so it is turned off
 * here. Consequence: pitch is no longer limited by zoom level for this camera,
 * so it keeps the requested tilt when zoomed in or out later.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  camera.limits.pitchDisabledRadiusScale = null;
  setGeospatialOrientation(camera, { pitch });
}
