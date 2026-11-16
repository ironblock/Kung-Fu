import type { GeospatialCamera } from "@babylonjs/lite";

// Sign of the Y component of the east direction on the planet.
// The planet has north along +Z and its longitude-0 point on +X. Babylon
// renders left-handed, so an outside viewer facing the planet with north up
// has east on the right, which is -Y. Longitude therefore increases towards -Y.
// If a camera given a heading of 90 degrees does not look toward increasing
// longitude, flip this sign.
const EAST_Y_SIGN = -1;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude. The zoom (radius), heading (yaw) and tilt (pitch) are not changed.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const radius = camera.limits.planetRadius;
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);

  // Assign a whole object: writing center.x/y/z in place does not recompute the camera position.
  camera.center = {
    x: radius * cosLat * Math.cos(lon),
    y: EAST_Y_SIGN * radius * cosLat * Math.sin(lon),
    z: radius * Math.sin(lat),
  };
}
