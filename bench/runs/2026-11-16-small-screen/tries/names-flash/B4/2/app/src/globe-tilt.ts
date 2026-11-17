import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    return;
  }

  // Preserve the things the call must not change.
  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = camera.center;

  // Make the requested pitch reachable now and after future zoom changes.
  // Newly created cameras start fully zoomed out, where radius-based pitch
  // limits can otherwise prevent a tilt from being applied or retained.
  const limits = camera.limits;
  limits.pitchMin = Math.min(limits.pitchMin, pitch);
  limits.pitchMax = Math.max(limits.pitchMax, pitch);
  limits.pitchDisabledRadiusScale = null;

  // Use the exact orientation setter to keep yaw/radius/center unchanged while
  // forcing the camera to look at its center point at the requested pitch.
  camera._setOrientation(yaw, pitch, radius, center);
}
