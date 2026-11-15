import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude on the planet surface (a sphere of radius `limits.planetRadius`
 * centred at the origin). Yaw, pitch and radius are left unchanged.
 *
 * Axes: the pole is world +Z (north), lat 0 / lon 0 is world +X, and east
 * (increasing longitude) is world +Y there.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a new object rather than editing camera.center in place: an
    // assignment re-orbits the camera at once, an in-place edit does not.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
