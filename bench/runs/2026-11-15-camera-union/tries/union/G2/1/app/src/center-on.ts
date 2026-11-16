import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude
 * and longitude, on the sphere of radius `camera.limits.planetRadius` centred
 * at the origin. Yaw, pitch and radius are left unchanged.
 *
 * Convention (Babylon Lite GeospatialCamera):
 * - north is +Z, so latitude +90 is the +Z pole;
 * - the newly created camera centre (latitude 0, longitude 0) is on +X;
 * - east is -Y at that centre, so positive longitude moves toward -Y there.
 *   A camera centred at longitude 0 with yaw PI/2 (heading east) therefore
 *   looks toward positive longitude.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    // A new object is assigned (rather than writing x/y/z in place) so the
    // camera re-orbits its eye around the new centre immediately.
    camera.center = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };
}
