import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Remove the pitch-disabled radius scale so the tilt is honored at any
    // zoom level (including fully zoomed out) and persists when the camera
    // later moves nearer to or farther from the globe.
    camera.limits.pitchDisabledRadiusScale = null;

    // Set only the pitch; yaw, radius, and center are left unchanged.
    setGeospatialOrientation(camera, { pitch });
}
