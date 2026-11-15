import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees), on the planet surface. Zoom (radius), heading (yaw) and
 * tilt (pitch) are left unchanged.
 *
 * Geometry: planet centred at the origin, north is +Z, and a point at
 * latitude 0 / longitude 0 is at (R, 0, 0). East at that point is +Y, so
 * longitude increases toward +Y.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a whole object: writing camera.center.x in place does not recompute the position.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
