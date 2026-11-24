import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre to the surface point at the given latitude and
 * longitude (degrees). Yaw, pitch and radius are left as they were.
 *
 * Frame, as described for Babylon Lite's geospatial camera:
 *   - the planet is centred at the origin;
 *   - at latitude 0, longitude 0 the surface normal ("up") is +X;
 *   - north is +Z;
 *   - east is up × north, which is -Y at longitude 0.
 *
 * The east sign is an inference from the stated geometry, not checked
 * against the library source, which is not available here.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;

    const cosLat = Math.cos(lat);
    // Unit surface normal: up = +X, north = +Z, east = -Y (at lon 0).
    const ux = cosLat * Math.cos(lon);
    const uy = -cosLat * Math.sin(lon);
    const uz = Math.sin(lat);

    const center = {
        x: planetRadius * ux,
        y: planetRadius * uy,
        z: planetRadius * uz,
    };

    // Keep the current orientation; setGeospatialOrientation avoids pitch
    // being re-clamped by a separate write.
    const yaw = camera.yaw;
    const pitch = camera.pitch;
    const radius = camera.radius;

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });
}
