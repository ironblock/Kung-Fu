import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude
 * and longitude. The point lies on the sphere of radius `camera.limits.planetRadius`
 * centred at the origin. Yaw (heading), pitch (tilt) and radius (zoom) are left unchanged.
 *
 * Axis convention assumed here (not confirmed against the library source):
 *   - Y is up; the north pole is at +Y.
 *   - Longitude 0 is on the +Z side of the equator; east is toward +X.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Update the existing centre object in place so any references to it stay valid.
    // yaw, pitch and radius are not touched, so heading, tilt and zoom are preserved.
    camera.center.x = radius * cosLat * Math.sin(lon);
    camera.center.y = radius * Math.sin(lat);
    camera.center.z = radius * cosLat * Math.cos(lon);
}
