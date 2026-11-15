import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // By default the camera's limits take the tilt away as it zooms out (fully at 4x the planet radius).
    camera.limits.pitchDisabledRadiusScale = null;
    camera.pitch = pitch;
}
