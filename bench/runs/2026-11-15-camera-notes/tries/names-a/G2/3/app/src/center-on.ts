import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the surface point at the given latitude
 * and longitude (degrees). Zoom (radius), heading (yaw) and tilt (pitch) are
 * left unchanged.
 *
 * Axis convention assumed here (NOT verified against the library, which is not
 * available locally): the planet is centred on the origin with its north pole
 * on +Y, latitude 0 / longitude 0 on +Z, and longitude increasing towards +X.
 * If the library's convention differs, change only the three assignments to
 * `camera.center` below.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;

    const cosLat = Math.cos(lat);
    camera.center.x = radius * cosLat * Math.sin(lon);
    camera.center.y = radius * Math.sin(lat);
    camera.center.z = radius * cosLat * Math.cos(lon);
}
