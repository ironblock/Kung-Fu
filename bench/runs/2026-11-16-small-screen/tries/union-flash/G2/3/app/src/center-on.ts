import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
  const planetRadius = camera.limits.planetRadius;
  const lat = latitudeDeg * DEG_TO_RAD;
  const lon = longitudeDeg * DEG_TO_RAD;
  const cosLat = Math.cos(lat);

  // From the notes: lat 0 / lon 0 is +X, north is +Z, and positive longitude
  // (east) is toward -Y.
  const center = {
    x: planetRadius * cosLat * Math.cos(lon),
    y: -planetRadius * cosLat * Math.sin(lon),
    z: planetRadius * Math.sin(lat),
  };

  // Assigning a new center object should re-orbit immediately. The explicit
  // _setOrientation call preserves the current yaw/pitch/radius if the
  // assignment does not already do that in the active implementation.
  camera.center = center;

  if (typeof camera._setOrientation === "function") {
    camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
  }
}
