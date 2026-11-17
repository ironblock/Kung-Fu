import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const r = camera.limits.planetRadius;
  const lat = latitudeDeg * (Math.PI / 180);
  const lon = longitudeDeg * (Math.PI / 180);

  const center: GeospatialCamera["center"] = {
    x: r * Math.cos(lat) * Math.sin(lon),
    y: r * Math.sin(lat),
    z: r * Math.cos(lat) * Math.cos(lon),
  };

  camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
}
