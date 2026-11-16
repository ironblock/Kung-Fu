import type { GeospatialCamera } from "@babylonjs/lite";

// Axis convention for the globe. ASSUMED, NOT VERIFIED against Babylon Lite 1.39.0:
//   north pole      = +Y
//   lat 0, lon 0    = +Z
//   east (lon +90)  = +X
// If the library uses a different north or east axis, change the formula below.
const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude, on the sphere of the camera's planet radius centred at the origin.
 * Yaw, pitch and radius are left as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assigning a new object (rather than writing x/y/z in place) makes the
    // camera re-orbit the new centre immediately.
    camera.center = {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };
}
