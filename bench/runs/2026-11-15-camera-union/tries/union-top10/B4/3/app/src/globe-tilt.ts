import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon, keeping its yaw, radius and centre.
 *
 * The library clamps pitch against the radius it is applied with. At the
 * fully zoomed-out start radius (4R) the default radius-based limit forces
 * pitch to ~0.001, so the tilt would not take. We therefore clear
 * `pitchDisabledRadiusScale` so the tilt holds at every zoom, including
 * when the app later zooms in or out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // A running fly would overwrite the pose on a later frame; stop it.
    camera._cancelFly?.();

    // Turns off the radius-based pitch clamp (assumed: null = no such clamp).
    camera.limits.pitchDisabledRadiusScale = null;

    // Set pitch together with the current radius so the clamp uses that radius.
    // Yaw, radius and centre are passed through unchanged.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: camera.center,
    });
}
