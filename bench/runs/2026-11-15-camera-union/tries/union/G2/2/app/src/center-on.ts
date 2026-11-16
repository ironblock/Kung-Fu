import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees), on the sphere of radius `camera.limits.planetRadius`
 * centred at the origin. Zoom (radius), heading (yaw) and tilt (pitch) are
 * left as they are.
 *
 * Frame: north is +Z, and at a centre on +X east is -Y (Babylon Lite 1.39.0
 * camera-notes.md, item 54). So longitude 0 is +X, and positive longitude
 * runs toward -Y, which is the camera's own east.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // Assign a new object (not in-place writes) so the camera re-orbits at once.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
