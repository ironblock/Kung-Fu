import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  // Allow the requested pitch at any radius, including the fully zoomed-out start radius.
  camera.limits.pitchDisabledRadiusScale = null;
  camera.pitch = pitch;
}
