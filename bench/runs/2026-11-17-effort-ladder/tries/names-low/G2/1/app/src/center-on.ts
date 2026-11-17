import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const R = camera.limits.planetRadius;

    camera.center.x = R * Math.cos(lat) * Math.cos(lon);
    camera.center.y = R * Math.sin(lat);
    camera.center.z = -R * Math.cos(lat) * Math.sin(lon);
}
