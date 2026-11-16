import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees), on the sphere of radius `camera.limits.planetRadius`
 * centred at the origin. Zoom (radius), heading (yaw) and tilt (pitch) are kept.
 *
 * Axis convention assumed here (NOT verified against the library source):
 *   - the north pole is on +Y;
 *   - lat 0, lon 0 is on +Z;
 *   - east (increasing longitude) is toward +X at lat 0, lon 0.
 * If the library's yaw/east convention differs, this mapping must be adjusted.
 */
export function centerOnLatLon(
    camera: GeospatialCamera,
    latitudeDeg: number,
    longitudeDeg: number,
): void {
    const radius = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    const center = {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };

    // Stop any in-flight flight from overwriting the new centre.
    camera._cancelFly?.();

    // Passing the current yaw, pitch and radius keeps them unchanged.
    setGeospatialOrientation(camera, {
        center,
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
    });
}
