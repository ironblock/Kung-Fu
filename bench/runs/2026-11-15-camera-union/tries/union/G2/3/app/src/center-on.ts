import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees) on the planet surface: a sphere of radius
 * camera.limits.planetRadius centred at the origin. Yaw, pitch and radius are
 * left unchanged.
 *
 * Axes follow the camera's own convention (camera-notes.md, note 54):
 *   - lat 0, lon 0 is (R, 0, 0), the point a new camera is centred on;
 *   - north is +Z;
 *   - east is -Y there, the direction a camera with yaw PI/2 looks.
 * Longitude therefore increases toward -Y at the equator, which is the
 * direction a heading of 90 degrees looks.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a new object rather than writing x/y/z in place: the camera only
    // re-orbits the new centre on the next yaw/pitch/radius write when the
    // centre is replaced as a whole (camera-notes.md, note 11).
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
