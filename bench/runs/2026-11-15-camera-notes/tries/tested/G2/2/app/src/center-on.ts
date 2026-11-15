import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees), on the sphere of radius `camera.limits.planetRadius`
 * centred at the origin. Yaw, pitch and radius are kept as they are.
 *
 * Axes follow the GeospatialCamera convention: north is +Z, and the point at
 * longitude 0 on the equator is +X. At that centre, yaw 0 looks toward +Z
 * (north) and yaw PI/2 (east) looks toward -Y, so positive longitude maps to
 * -Y in the equatorial plane.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const r = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center: {
            x: r * cosLat * Math.cos(lon),
            y: -r * cosLat * Math.sin(lon),
            z: r * Math.sin(lat),
        },
    });
}
