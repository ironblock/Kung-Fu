import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = camera.center;

  camera.limits = {
    ...camera.limits,
    pitchMin: Math.min(camera.limits.pitchMin, pitch),
    pitchMax: Math.max(camera.limits.pitchMax, pitch),
    pitchDisabledRadiusScale: null,
  };

  camera._setOrientation(yaw, pitch, radius, center);
}
