import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude
 * on the planet surface (a sphere of radius `camera.limits.planetRadius` centred at the origin).
 *
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 *
 * Axes, from the Babylon Lite camera notes: north is +Z, and at a centre on +X
 * (latitude 0, longitude 0) yaw PI/2 (east) looks toward -Y. So the surface point is
 *   x = R cos(lat) cos(lon), y = -R cos(lat) sin(lon), z = R sin(lat).
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const radius = camera.limits.planetRadius;
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cosLat = Math.cos(lat);

  // Assign a new object (not an in-place write) so the camera re-orbits at once.
  camera.center = {
    x: radius * cosLat * Math.cos(lon),
    y: -radius * cosLat * Math.sin(lon),
    z: radius * Math.sin(lat),
  };
}
