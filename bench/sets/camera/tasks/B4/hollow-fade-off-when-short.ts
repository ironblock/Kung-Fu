import { getEffectivePitchMax } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Loosen the camera's limits only when the tilt asked for is out of reach at this zoom.
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (getEffectivePitchMax(camera.limits, camera.radius) < pitch) {
        camera.limits.pitchDisabledRadiusScale = null;
    }
    camera.pitch = pitch;
}
