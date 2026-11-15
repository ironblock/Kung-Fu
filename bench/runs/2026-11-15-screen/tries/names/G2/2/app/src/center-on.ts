import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Center = GeospatialCamera["center"];

// Assumed planet axis convention (NOT verified against the library source):
//   - planet centred at the origin
//   - north pole along +Y
//   - latitude 0, longitude 0 on the +Z axis
//   - east (increasing longitude) along +X at longitude 0
// If the library's default centre or axes differ, change only surfacePoint().
function surfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number): Center {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    return {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    } as Center;
}

/**
 * Moves the camera's centre point to the given latitude/longitude on the planet
 * surface. Yaw (heading), pitch (tilt) and radius (zoom) are left unchanged.
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
