import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

// Local frame, as in camera-notes.md note 54: north is +Z, and at lat 0, lon 0
// (the point (R, 0, 0)) east is -Y. Increasing longitude therefore moves toward -Y.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const r = camera.limits.planetRadius;
  const cosLat = Math.cos(lat);

  // Keep yaw (heading), pitch and radius exactly as they are; only the centre changes.
  setGeospatialOrientation(camera, {
    yaw: camera.yaw,
    pitch: camera.pitch,
    radius: camera.radius,
    center: {
      x: r * cosLat * Math.cos(lon),
      y: -r * cosLat * Math.sin(lon),
      z: r * Math.sin(lat),
    },
  });
}
