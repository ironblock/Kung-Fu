import type { GeospatialCamera } from "@babylonjs/lite";

// The camera's local frame at its start (R, 0, 0): up is +X, north is +Z (WORLD_NORTH), and east is
// cross(up, north) = -Y. So positive longitude runs toward -Y, mirrored from textbook ECEF.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    camera.center = { x: R * Math.cos(lat) * Math.cos(lon), y: -R * Math.cos(lat) * Math.sin(lon), z: R * Math.sin(lat) };
}
