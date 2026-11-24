import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(
  camera: GeospatialCamera,
  latitudeDeg: number,
  longitudeDeg: number,
): void {
  const planetRadius = camera.limits.planetRadius;

  const latitude = (latitudeDeg * Math.PI) / 180;
  const longitude = (longitudeDeg * Math.PI) / 180;

  const x = planetRadius * Math.cos(latitude) * Math.cos(longitude);
  const y = -planetRadius * Math.cos(latitude) * Math.sin(longitude);
  const z = planetRadius * Math.sin(latitude);

  camera.center = { x, y, z };
}
