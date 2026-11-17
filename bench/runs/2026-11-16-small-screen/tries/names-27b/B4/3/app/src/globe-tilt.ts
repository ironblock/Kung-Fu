import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const limits = camera.limits;

  limits.pitchDisabledRadiusScale = null;
  limits.pitchMax = Math.max(limits.pitchMax, pitch);
  limits.pitchMin = Math.min(limits.pitchMin, pitch);

  camera._setOrientation(camera.yaw, pitch, camera.radius, camera.center);
  camera.pitch = pitch;
}
