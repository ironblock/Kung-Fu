import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees; north and east positive). Yaw, pitch and radius are unchanged.
 *
 * Frame assumption (not verified against the library source, which is not on this
 * machine): the planet is Y-up and centred at the origin, the north pole is +Y, and
 * the lat 0 / lon 0 point is on +Z. Longitude increases toward +X (east at lon 0).
 * If the library's default centre (createGeospatialCamera) is not +Z, or its
 * east/north axes differ, change the mapping below to match.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);

    setGeospatialOrientation(camera, {
        center: {
            x: radius * cosLat * Math.sin(lon),
            y: radius * Math.sin(lat),
            z: radius * cosLat * Math.cos(lon),
        },
    });
}
