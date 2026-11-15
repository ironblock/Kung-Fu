import type { GeospatialCamera } from "@babylonjs/lite";

/*
 * Planet-fixed axis convention used to turn (latitude, longitude) into a point
 * on the sphere.
 *
 * ASSUMPTION: the camera declarations do not say which world axis is the pole,
 * which meridian is longitude 0, or which way east points, and the library
 * source is not available to check. The values below are a best guess and
 * must be verified against Babylon Lite 1.39.0 before relying on this:
 *   - the north pole lies on +Y
 *   - longitude 0 lies on +Z, so east (increasing longitude) is +X at longitude 0
 * If the camera's own north/east differ (e.g. handedness), change the formula
 * in `surfacePoint` only.
 */

/** Converts latitude/longitude in degrees to a point on a sphere of `radius` centred at the origin. */
function surfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number) {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    return {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };
}

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude.
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const p = surfacePoint(latitudeDeg, longitudeDeg, camera.limits.planetRadius);
    // Write into the existing centre vector so any references to it stay valid.
    camera.center.x = p.x;
    camera.center.y = p.y;
    camera.center.z = p.z;
}
