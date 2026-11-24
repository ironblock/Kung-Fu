import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const radius = camera.limits.planetRadius;
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);

  // Geospatial frame: latitude 0 / longitude 0 is at +z,
  // positive latitude is +y, positive longitude is +x.
  const center = {
    x: radius * cosLat * Math.sin(lon),
    y: radius * Math.sin(lat),
    z: radius * cosLat * Math.cos(lon),
  };

  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
    center,
  });
}
