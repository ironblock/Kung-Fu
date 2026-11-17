import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  const requested = Number.isFinite(pitch) ? pitch : 0;
  const desiredPitch = Math.max(0, Math.min(Math.PI / 2, requested));

  // Disable the radius-dependent pitch clamp. Otherwise the default limits
  // force pitch back to ~0 at the fully zoomed-out radius and would do so
  // again when the app later zooms nearer/farther.
  camera.limits.pitchDisabledRadiusScale = null;

  // Apply yaw/pitch/radius/center together so zoom, heading, and center stay
  // unchanged while the camera re-orbits to look at its center at the pitch.
  if (typeof camera._setOrientation === "function") {
    camera._setOrientation(camera.yaw, desiredPitch, camera.radius, camera.center);
  } else {
    camera.pitch = desiredPitch;
    // If pitch did not change (or to ensure the limits change takes effect),
    // a center assignment re-orbits/applies the new limits.
    camera.center = camera.center;
  }
}
