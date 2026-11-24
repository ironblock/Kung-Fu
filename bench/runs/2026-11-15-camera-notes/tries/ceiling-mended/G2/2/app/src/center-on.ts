import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude, on a sphere of the camera's planet radius centred at the origin.
 * Zoom (radius), heading (yaw) and tilt (pitch) are left as they are.
 *
 * Uses the camera's own frame: latitude 0, longitude 0 is +X (where a new camera
 * is centred), north is +Z and east at that point is -Y. Because yaw is measured
 * from local north, a heading of 90° faces toward increasing longitude.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    if (!Number.isFinite(latitudeDeg) || !Number.isFinite(longitudeDeg)) {
        throw new RangeError(`centerOnLatLon: latitude and longitude must be finite numbers (got ${latitudeDeg}, ${longitudeDeg})`);
    }

    const planetRadius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // "+ 0" turns any -0 into 0.
    const center: GeospatialCamera["center"] = {
        x: planetRadius * cosLat * Math.cos(lon) + 0,
        y: -planetRadius * cosLat * Math.sin(lon) + 0,
        z: planetRadius * Math.sin(lat) + 0,
    };

    // Give it a new object rather than writing center.x/y/z in place. The camera
    // only moves the eye around the new centre straight away when center is
    // replaced as a whole.
    camera.center = center;
}
