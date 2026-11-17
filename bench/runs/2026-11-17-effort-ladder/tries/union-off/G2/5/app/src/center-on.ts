import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Map a latitude/longitude (degrees) to a point on the planet's surface:
 * a sphere of radius `radius` centred at the origin.
 *
 * Axis convention (camera notes #54): at the centre for latitude 0 /
 * longitude 0 the outward normal is +X, north is +Z, and east (yaw PI/2)
 * points toward -Y. Hence increasing longitude moves toward -Y.
 */
function latLonToSurface(
  radius: number,
  latitudeDeg: number,
  longitudeDeg: number,
): { x: number; y: number; z: number } {
  const phi = (latitudeDeg * Math.PI) / 180;
  const lambda = (longitudeDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  return {
    x: radius * cosPhi * Math.cos(lambda),
    y: -radius * cosPhi * Math.sin(lambda),
    z: radius * Math.sin(phi),
  };
}

/**
 * Move the camera's centre to the ground point at the given latitude and
 * longitude, leaving zoom (radius), heading (yaw) and tilt (pitch) unchanged.
 */
export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const radius = camera.limits.planetRadius;
  // Assign a whole new object to `center` so the camera re-orbits around the
  // new centre at once (writing center.x/y/z in place would defer the move,
  // see camera notes #11). yaw, pitch and radius are not touched.
  camera.center = latLonToSurface(radius, latitudeDeg, longitudeDeg);
}
