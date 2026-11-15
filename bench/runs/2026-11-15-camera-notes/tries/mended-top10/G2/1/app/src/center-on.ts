import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";
import type { Vec3 } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude, on the planet sphere (radius = camera.limits.planetRadius, centred
 * at the origin). Yaw, pitch and radius are kept as they are.
 *
 * ASSUMED CONVENTION (not verified against the library source, which is not
 * available here):
 *   - the planet's north pole is on +Y;
 *   - at latitude 0, longitude 0 the point is on +Z;
 *   - east (increasing longitude) is +X at that point.
 * If the library's own east/north basis differs, the mapping below must be
 * changed to match it, or headings will not point north/east.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    const center: Vec3 = {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };

    setGeospatialOrientation(camera, {
        center,
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
    });
}
