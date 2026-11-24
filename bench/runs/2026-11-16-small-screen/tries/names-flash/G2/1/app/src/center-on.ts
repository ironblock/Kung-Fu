import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Centers the geospatial camera on a latitude/longitude point on the planet
 * surface while preserving the current yaw/heading, pitch/tilt, and radius/zoom.
 *
 * This uses the coordinate convention implied by the prompt:
 *   - latitude 0 / longitude 0 is at +Z
 *   - positive latitude / north is +Y
 *   - positive longitude / east is +X
 *
 * With that convention, a camera centered at lat/lon 0,0 and given a heading/yaw
 * of 90° looks toward increasing longitude.
 */
export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const planetRadius = camera.limits.planetRadius;

  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;

  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const cosLon = Math.cos(lon);
  const sinLon = Math.sin(lon);

  const center = camera.center;

  center.x = planetRadius * cosLat * sinLon;
  center.y = planetRadius * sinLat;
  center.z = planetRadius * cosLat * cosLon;

  if (camera._cancelFly) {
    camera._cancelFly();
  }

  if (typeof camera._setOrientation === "function") {
    camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
  }
}
