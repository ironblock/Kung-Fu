import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const planetRadius = camera.limits.planetRadius;

  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;

  const cosLat = Math.cos(lat);

  // The notes state that, for a GeospatialCamera, north is +Z and east at
  // latitude 0 / longitude 0 is -Y. That makes positive longitude move from
  // +X toward -Y, so y is negative * sin(lon).
  const x = planetRadius * cosLat * Math.cos(lon);
  const y = -planetRadius * cosLat * Math.sin(lon);
  const z = planetRadius * Math.sin(lat);

  // Update the existing centre vector, then assign it back. Assigning the
  // centre (even the same reference) re-orbits the camera using the current
  // yaw, pitch, and radius, so zoom/heading/tilt are not intentionally changed.
  const center = camera.center;
  center.x = x;
  center.y = y;
  center.z = z;
  camera.center = center;
}
