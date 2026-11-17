import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;

    const x = R * Math.cos(lat) * Math.cos(lon);
    const y = -R * Math.cos(lat) * Math.sin(lon);
    const z = R * Math.sin(lat);

    camera.center = { x, y, z };
}
