import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const planetRadius = camera.limits.planetRadius;
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;

  // Default geospatial reference frame assumed here:
  // lat 0 / lon 0 is +Z, north is +Y, east is +X.
  // Positive longitude therefore moves toward +X.
  const cosLat = Math.cos(lat);
  const center = camera.center;

  center.x = planetRadius * cosLat * Math.sin(lon);
  center.y = planetRadius * Math.sin(lat);
  center.z = planetRadius * cosLat * Math.cos(lon);

  const { yaw, pitch, radius } = camera;
  camera._setOrientation(yaw, pitch, radius, center);
}
