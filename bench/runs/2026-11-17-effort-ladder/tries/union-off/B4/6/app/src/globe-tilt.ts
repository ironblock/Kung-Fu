import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts the geospatial camera so it looks at its centre point at the given
 * pitch, without changing the zoom (radius), heading (yaw) or centre point.
 *
 * @param camera The geospatial camera to adjust.
 * @param pitch Pitch in radians, measured from looking straight down at the
 *              ground (0) toward the horizon. Expected in roughly [0.1, 1.2].
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Disable the radius-dependent pitch clamp so the requested pitch holds at
    // any zoom level, including the fully-zoomed-out starting radius where the
    // default limits would otherwise force pitch back to ~0.
    camera.limits.pitchDisabledRadiusScale = null;

    // Re-apply the orientation with the same radius, yaw and centre so only the
    // pitch changes. Passing radius alongside pitch ensures the clamp (now
    // disabled) is evaluated against the correct radius.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: pitch,
        radius: camera.radius,
        center: camera.center,
    });
}
