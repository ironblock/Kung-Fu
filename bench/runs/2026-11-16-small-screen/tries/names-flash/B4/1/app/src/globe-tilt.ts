import type { GeospatialCamera } from "@babylonjs/lite";

const PITCH_LIMIT_MARGIN = 1e-3;

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const requestedPitch = Number.isFinite(pitch) ? pitch : 0;

  // Preserve the current heading, zoom, and centre while applying the tilt.
  const yaw = camera.yaw;
  const radius = camera.radius;
  const center = camera.center;

  // The declarations show that pitch can be limited in a radius-dependent way.
  // Open up the pitch limits and remove radius-based pitch disabling so the
  // requested tilt is legal now and remains legal when the radius changes later.
  const limits = camera.limits;
  if (limits) {
    const minPitch = Number.isFinite(limits.pitchMin) ? limits.pitchMin : requestedPitch;
    const maxPitch = Number.isFinite(limits.pitchMax) ? limits.pitchMax : requestedPitch;

    limits.pitchMin = Math.min(minPitch, requestedPitch - PITCH_LIMIT_MARGIN);
    limits.pitchMax = Math.max(maxPitch, requestedPitch + PITCH_LIMIT_MARGIN);
    limits.pitchDisabledRadiusScale = null;
  }

  // If a fly/animation is running, cancel it so it cannot override this tilt later.
  camera._cancelFly?.();

  // Use the camera’s orientation setter so the look-at state is recomputed together
  // with yaw/pitch/radius/center. The fallback is defensive in case the runtime object
  // does not expose _setOrientation.
  if (typeof camera._setOrientation === "function") {
    camera._setOrientation(yaw, requestedPitch, radius, center);
  } else {
    camera.yaw = yaw;
    camera.pitch = requestedPitch;
    camera.radius = radius;
    camera.center = center;

    if (camera._lookAt) {
      camera._lookAt = center;
    }
  }
}
