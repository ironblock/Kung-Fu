import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const planetRadius = camera.limits.planetRadius;
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;

  const cosLat = Math.cos(lat);
  const x = planetRadius * cosLat * Math.cos(lon);
  const y = -planetRadius * cosLat * Math.sin(lon);
  const z = planetRadius * Math.sin(lat);

  // Assigning a whole new center object re-orbits the camera immediately while
  // leaving yaw, pitch, and radius unchanged.
  camera.center = { x, y, z };
}
