import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

// Axis convention for the planet sphere (centred at the origin).
// ASSUMED, not verified against the Babylon Lite source (not available here):
//   - +Y is the north pole.
//   - Latitude 0, longitude 0 lies on +X.
//   - Longitude increases eastward, so east at (lat 0, lon 0) is -Z.
// If the library's axes differ, change surfacePoint() only.

const DEG_TO_RAD = Math.PI / 180;

function surfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number) {
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    return {
        x: radius * cosLat * Math.cos(lon),
        y: radius * Math.sin(lat),
        z: -radius * cosLat * Math.sin(lon),
    };
}

/**
 * Moves the camera's centre point to the surface point at the given latitude
 * and longitude (degrees; north and east positive). Yaw, pitch and radius are
 * passed through unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const center = surfacePoint(latitudeDeg, longitudeDeg, camera.limits.planetRadius);
    setGeospatialOrientation(camera, {
        center,
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
    });
}
