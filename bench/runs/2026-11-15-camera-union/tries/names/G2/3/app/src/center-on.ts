import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Frame assumed for the planet (not verified against the library source, which is not
// available here). The sphere is centred at the origin and:
//   lat 0, lon 0  -> (0, 0, R)   new camera centre
//   east at (0,0) -> +X          (d/dlon of the surface point)
//   north at (0,0)-> +Y          (d/dlat of the surface point, the pole is at +Y)
// If the library's planet frame differs, change surfacePoint() only.
function surfacePoint(latitudeDeg: number, longitudeDeg: number, radius: number): { x: number; y: number; z: number } {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    return {
        x: radius * cosLat * Math.sin(lon),
        y: radius * Math.sin(lat),
        z: radius * cosLat * Math.cos(lon),
    };
}

/**
 * Moves the camera's centre point to the surface point at the given latitude and
 * longitude (degrees; north and east positive). Yaw, pitch (tilt) and radius (zoom)
 * are left as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const point = surfacePoint(latitudeDeg, longitudeDeg, camera.limits.planetRadius);
    setGeospatialOrientation(camera, { center: point });
}
