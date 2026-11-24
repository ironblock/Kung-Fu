import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
  if (!Number.isFinite(pitch)) {
    return;
  }

  // At the default far zoom (radius >= 4 * planetRadius), the geospatial limits
  // force pitch back toward nadir. Disabling the radius-dependent pitch limit
  // lets the requested tilt be accepted now and preserved when the camera is
  // later zoomed nearer to or farther from the globe.
  camera.limits.pitchDisabledRadiusScale = null;

  // Writing pitch alone re-orbits around the current centre, so zoom (radius),
  // heading (yaw), and centre values are not changed. If pitch is already
  // numerically equal to the target, reassign centre to force the new limits /
  // orientation to be re-evaluated without changing the centre point.
  if (camera.pitch !== pitch) {
    camera.pitch = pitch;
  } else {
    camera.center = camera.center;
  }
}
