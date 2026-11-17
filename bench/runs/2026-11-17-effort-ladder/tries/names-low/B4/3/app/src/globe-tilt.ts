import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Widen the pitch ceiling so the requested tilt is legal at every zoom level.
    if (camera.limits.pitchMax < pitch) {
        camera.limits.pitchMax = pitch;
    }
    // Remove radius-dependent pitch clamping so the tilt survives zoom changes.
    camera.limits.pitchDisabledRadiusScale = null;

    // Apply only the pitch; yaw, radius, and center are left untouched.
    setGeospatialOrientation(camera, { pitch });
}
