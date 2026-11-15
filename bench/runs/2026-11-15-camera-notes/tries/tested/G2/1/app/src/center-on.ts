import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees) on the planet surface. Zoom (radius), heading (yaw) and
 * tilt (pitch) are left unchanged.
 *
 * Frame: the pole axis is world Z (north = +Z), and latitude 0 / longitude 0
 * is the point (R, 0, 0), where east = +Y and north = +Z. East x North = Up
 * there, so the basis is right-handed.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a new object: the camera copies it and re-orbits around it.
    // Editing camera.center.x/y/z in place would not move the camera.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
