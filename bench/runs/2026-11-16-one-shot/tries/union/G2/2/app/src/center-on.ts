import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude.
 *
 * Axes, from the camera's own conventions (see notes 54 and 51):
 *   - north is +Z, so latitude is asin(z / radius);
 *   - at longitude 0 east is -Y, so the point is (cos(lat) cos(lon), -cos(lat) sin(lon), sin(lat)) * radius.
 *     Heading PI/2 (east) therefore looks toward increasing longitude.
 *
 * yaw, pitch and radius are left unchanged, so zoom and tilt are kept and the
 * heading stays the same relative to local north. Assigning a new object to
 * `center` makes the camera re-orbit at once.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    const center: Vec3 = {
        x: radius * cosLat * Math.cos(lon),
        y: -radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };

    camera.center = center;
}
