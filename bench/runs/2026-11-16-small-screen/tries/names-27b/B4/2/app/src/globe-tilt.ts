import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = camera.center;

  const limits = camera.limits;
  limits.pitchMax = Math.max(limits.pitchMax, pitch);
  limits.pitchMin = Math.min(limits.pitchMin, pitch);
  limits.pitchDisabledRadiusScale = null;

  camera._setOrientation(yaw, pitch, radius, center);
}
