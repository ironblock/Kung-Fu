import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

// Axis convention (Babylon is left-handed, Y up). ASSUMED, not verified against
// the library source, which is not available on this machine:
//   - north pole is on +Y
//   - latitude 0, longitude 0 is on +Z
//   - east at longitude 0 is -X (viewed from outside with north up, east is on the right,
//     which is -X when looking at the globe from +Z in a left-handed system)
// If the library's default centre or east direction differs, change the signs here.
function latLonToSurfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number) {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    return {
        x: -radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };
}

/**
 * Moves the camera's centre to the surface point at the given latitude and longitude.
 * Zoom (radius), heading (yaw) and tilt (pitch) are kept as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const center = latLonToSurfacePoint(latitudeDeg, longitudeDeg, camera.limits.planetRadius);

    // Drop any fly animation in progress so it does not overwrite the new centre.
    camera._cancelFly?.();

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
