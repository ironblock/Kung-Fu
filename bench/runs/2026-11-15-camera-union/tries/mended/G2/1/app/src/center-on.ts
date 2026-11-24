import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the surface point at the given latitude and
 * longitude (degrees). The point lies on a sphere of the camera's planet radius,
 * centred at the origin. Zoom (radius), heading (yaw) and tilt (pitch) are unchanged.
 *
 * Geometry: the pole axis is world Z, so north is +Z. Longitude 0 is +X, and east
 * at longitude 0 is +Y, so positive longitude moves toward +Y.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a new object rather than editing camera.center in place: an in-place
    // edit does not move the camera until the next yaw, pitch or radius change.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
