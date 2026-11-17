import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLookAtFromYawPitch } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    return;
  }

  camera._cancelFly?.();

  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = camera.center;

  const limits = camera.limits;
  if (limits) {
    // Make the requested pitch valid at the current zoom, and keep it valid
    // when the app later changes the zoom distance.
    limits.pitchDisabledRadiusScale = null;
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
  }

  // Use the internal orientation setter so the requested pitch can be applied
  // even when the public orientation helper would normally clamp it at the
  // fully-zoomed-out radius.
  camera.pitch = pitch;
  camera._setOrientation(yaw, pitch, radius, center);

  // Refresh the camera’s internal look-at target so it really aims at the
  // centre point with the requested tilt.
  camera._lookAt = computeLookAtFromYawPitch(yaw, pitch, center, camera._lookAt);
}
