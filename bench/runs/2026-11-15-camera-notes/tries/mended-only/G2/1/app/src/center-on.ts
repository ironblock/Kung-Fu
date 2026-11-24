import { Vec3 } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees; north and east positive) on the planet surface.
 *
 * The planet's pole axis is world Z and the point (latitude 0, longitude 0)
 * is on world +X, matching a newly created GeospatialCamera's centre. Yaw,
 * pitch and radius are left alone, so zoom, heading and tilt are kept.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const radius = camera.planetRadius;
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);

  // Assigning a new Vec3 re-orbits the camera about the new centre at once.
  camera.center = new Vec3(
    radius * cosLat * Math.cos(lon),
    radius * cosLat * Math.sin(lon),
    radius * Math.sin(lat),
  );
}
