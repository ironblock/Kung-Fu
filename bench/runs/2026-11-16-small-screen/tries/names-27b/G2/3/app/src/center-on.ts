import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const r = camera.limits.planetRadius;
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);

  const center = camera.center;
  center.x = Math.sin(lon) * cosLat * r;
  center.y = Math.sin(lat) * r;
  center.z = Math.cos(lon) * cosLat * r;

  camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
}
