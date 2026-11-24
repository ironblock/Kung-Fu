import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const r = camera.limits.planetRadius;
  const cosLat = Math.cos(lat);

  camera.center = {
    x: r * cosLat * Math.cos(lon),
    y: -r * cosLat * Math.sin(lon),
    z: r * Math.sin(lat),
  };
}
