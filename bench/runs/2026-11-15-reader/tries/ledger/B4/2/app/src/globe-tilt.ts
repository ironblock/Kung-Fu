import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a globe camera to `pitch` radians from looking straight down (0) toward the horizon.
 *
 * The camera keeps its zoom (radius), heading (yaw) and centre point. The pitch is kept at
 * every zoom level: the library's default limits lower the pitch ceiling as the camera zooms
 * out (to about 0 at `radiusMax`), so the pitch limit is turned off here. Without that, a fresh
 * camera would be clamped to straight down, and a later zoom-out would flatten the tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    setGeospatialOrientation(camera, { pitch });
}
