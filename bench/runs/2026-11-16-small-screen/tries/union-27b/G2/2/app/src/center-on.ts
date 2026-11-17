import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const R = camera.limits.planetRadius;
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  const center = {
    x: R * cosLat * Math.cos(lon),
    y: -R * cosLat * Math.sin(lon),
    z: R * Math.sin(lat),
  };
  setGeospatialOrientation(camera, { center });
}
