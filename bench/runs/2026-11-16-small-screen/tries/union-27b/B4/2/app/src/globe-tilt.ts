import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  // Remove the radius-dependent pitch clamp so the requested tilt survives
  // zooming in and out, including at the fully zoomed-out start radius.
  camera.limits.pitchDisabledRadiusScale = null;

  if (camera.pitch === pitch) {
    // A same-value pitch write may not re-apply orientation after an in-place
    // centre change, so make a tiny real write and then restore the requested
    // pitch.
    const eps = 1e-6;
    const { pitchMin, pitchMax } = camera.limits;

    const bumped =
      pitch + eps >= pitchMin && pitch + eps <= pitchMax
        ? pitch + eps
        : pitch - eps >= pitchMin && pitch - eps <= pitchMax
          ? pitch - eps
          : null;

    if (bumped !== null) {
      camera.pitch = bumped;
      camera.pitch = pitch;
    }
  } else {
    camera.pitch = pitch;
  }
}
