import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the surface point at `latitudeDeg` (north positive)
 * and `longitudeDeg` (east positive). The planet is a sphere of
 * `camera.limits.planetRadius` centred at the origin, with north along +Z,
 * and longitude 0 at +X (the point a new camera is centred on).
 * Yaw, pitch and radius are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // At (R, 0, 0) east is -Y (yaw PI/2 looks toward -Y, note 54),
    // so longitude moves y in the negative direction.
    // A whole new object is assigned so the camera re-orbits at once (note 11).
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
