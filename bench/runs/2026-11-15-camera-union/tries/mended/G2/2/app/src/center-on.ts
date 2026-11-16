import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees), on the sphere of the camera's planet radius centred at
 * the origin. Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 *
 * Axes follow the GeospatialCamera convention: north is +Z, so the north pole
 * is at (0, 0, R). At latitude 0, longitude 0 the centre is (R, 0, 0), and
 * east is -Y, so positive longitude runs toward -Y there. A heading of 90 deg
 * (yaw PI/2) therefore looks toward positive longitude.
 *
 * A whole new object is assigned to `center`, because writing its fields in
 * place does not re-orbit the camera until the next yaw/pitch/radius write.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
