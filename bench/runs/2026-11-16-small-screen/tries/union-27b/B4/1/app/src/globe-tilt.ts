import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  // Allow full pitch at every radius, including the fully zoomed-out start radius.
  camera.limits.pitchDisabledRadiusScale = null;

  // Only the pitch changes, so yaw, radius, and center are preserved.
  camera.pitch = pitch;
}
