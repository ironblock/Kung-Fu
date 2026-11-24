import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees) on the planet surface, a sphere of radius
 * `camera.limits.planetRadius` centred at the origin. Yaw (heading), pitch (tilt)
 * and radius (zoom) are left as they were.
 *
 * Axis convention used here (assumed, not verified against the library source):
 * the pole is on +Y, the meridian of longitude 0 passes through +Z, and east is
 * +X at longitude 0.
 *   x = R cos(lat) sin(lon)
 *   y = R sin(lat)
 *   z = R cos(lat) cos(lon)
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);

    const center: GeospatialCamera["center"] = {
        x: R * cosLat * Math.sin(lon),
        y: R * Math.sin(lat),
        z: R * cosLat * Math.cos(lon),
    };

    // Stop any running fly-to animation from pulling the camera back.
    camera._cancelFly?.();

    // Pass the current yaw/pitch/radius explicitly so they are preserved
    // regardless of how the library treats omitted fields.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
