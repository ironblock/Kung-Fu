import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the surface point for a latitude/longitude
 * pair on the camera's planet, preserving the current yaw (heading), pitch
 * (tilt), and radius (zoom).
 *
 * Assumes the usual Y-up / right-handed geospatial convention:
 *   lat = 0, lon = 0 -> +X
 *   north             -> +Y
 *   east              -> +Z
 * so a yaw of 90° (π/2) points toward positive longitude.
 */
export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const planetRadius = camera.limits.planetRadius;

  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;

  // Capture the current orientation before mutating the centre so that the
  // explicit orientation update below preserves zoom/heading/tilt.
  const yaw = camera.yaw;
  const pitch = camera.pitch;
  const radius = camera.radius;

  const cosLat = Math.cos(lat);
  const x = planetRadius * cosLat * Math.cos(lon);
  const y = planetRadius * Math.sin(lat);
  const z = planetRadius * cosLat * Math.sin(lon);

  const target = camera.center;
  target.x = x;
  target.y = y;
  target.z = z;

  camera._setOrientation(yaw, pitch, radius, target);
}
