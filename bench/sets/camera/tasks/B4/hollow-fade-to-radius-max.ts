import type { GeospatialCamera } from "@babylonjs/lite";

// Allow full tilt out to the farthest zoom the camera has.
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const k = camera.limits.radiusMax / camera.limits.planetRadius;
    camera.limits.pitchDisabledRadiusScale = { x: k, y: k + 1 };
    camera.pitch = pitch;
}
