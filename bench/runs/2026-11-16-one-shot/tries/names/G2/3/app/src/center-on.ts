import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

// Assumed frame (not verified against the library): +Y is the north pole,
// (lat 0, lon 0) is on +Z, and east at (lat 0, lon 0) is +X.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    const center = {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };

    // Keep yaw (heading), pitch and radius (zoom) as they are.
    camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
}
