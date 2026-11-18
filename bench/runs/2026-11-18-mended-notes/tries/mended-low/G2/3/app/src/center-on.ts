import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    camera.center = {
        x: R * Math.cos(lat) * Math.cos(lon),
        y: -R * Math.cos(lat) * Math.sin(lon),
        z: R * Math.sin(lat),
    };
}
