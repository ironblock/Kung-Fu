import { setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Ground point for a latitude/longitude, on a sphere of `radius` centred at the origin.
 *
 * ASSUMED FRAME (not confirmed against Babylon Lite 1.39.0 sources, which are not on this machine):
 *   - north pole is +Y
 *   - longitude 0 / latitude 0 is +Z
 *   - east at (0, 0) is +X, north at (0, 0) is +Y
 * If the library's globe uses a different frame, change only this function.
 */
function surfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number) {
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cosLat = Math.cos(lat);
  return {
    x: radius * cosLat * Math.sin(lon),
    y: radius * Math.sin(lat),
    z: radius * cosLat * Math.cos(lon),
  };
}

/**
 * Moves the camera's centre point to the ground point at the given latitude and longitude.
 * Zoom (radius), heading (yaw) and tilt (pitch) are passed back unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const center = surfacePoint(latitudeDeg, longitudeDeg, camera.limits.planetRadius);
  setGeospatialOrientation(camera, {
    center,
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
  });
}
