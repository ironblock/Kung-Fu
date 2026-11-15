import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees). The planet is a sphere of `camera.limits.planetRadius`
 * centred at the origin, with +Z as north. Longitude 0 is on +X, and positive
 * longitude goes towards +Y (east). Yaw, pitch and radius are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const r = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    // Assign a whole new vector: writing camera.center.x/y/z does not update the pose.
    camera.center = {
        x: r * cosLat * Math.cos(lon),
        y: r * cosLat * Math.sin(lon),
        z: r * Math.sin(lat),
    };
}
