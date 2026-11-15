import { Vector3 } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Moves the geospatial camera's centre to the ground point at the given
 * latitude and longitude (degrees), on a sphere of the camera's planet radius
 * centred at the origin. Latitude is positive north, longitude positive east,
 * with north = +Z and lat 0 / lon 0 = +X (the default centre of a new camera).
 *
 * Only `center` is written, as a whole object so that the camera recomputes its
 * position. Zoom (radius), heading (yaw) and tilt (pitch) are left untouched.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const r = camera.planetRadius;
  const cosLat = Math.cos(lat);

  camera.center = new Vector3(
    r * cosLat * Math.cos(lon),
    r * cosLat * Math.sin(lon),
    r * Math.sin(lat),
  );
}
