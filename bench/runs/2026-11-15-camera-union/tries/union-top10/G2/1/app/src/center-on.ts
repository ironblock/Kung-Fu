import type { GeospatialCamera } from "@babylonjs/lite";
import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the geospatial camera's centre to the surface point at the given
 * latitude/longitude (degrees; north and east positive). Yaw (heading), pitch
 * (tilt) and radius (zoom) are left unchanged.
 *
 * The local east/north/up frame is taken from the library itself
 * (computeLocalBasis) at the lat 0, lon 0 point, which is where a newly
 * created camera is centred. That keeps the library's own axis conventions
 * rather than assuming a particular world-axis layout.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;

    // Frame at lat 0, lon 0 (the centre of a freshly created camera).
    const origin = createGeospatialCamera({ planetRadius: radius }).center;
    const up0 = { x: 0, y: 0, z: 0 } as Vec3;
    const east0 = { x: 0, y: 0, z: 0 } as Vec3;
    const north0 = { x: 0, y: 0, z: 0 } as Vec3;
    computeLocalBasis(origin, east0, north0, up0);

    // Unit vector to the target point, in the (up0, east0, north0) frame.
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const wUp = cosLat * Math.cos(lon);
    const wEast = cosLat * Math.sin(lon);
    const wNorth = Math.sin(lat);

    const center = {
        x: radius * (wUp * up0.x + wEast * east0.x + wNorth * north0.x),
        y: radius * (wUp * up0.y + wEast * east0.y + wNorth * north0.y),
        z: radius * (wUp * up0.z + wEast * east0.z + wNorth * north0.z),
    } as Vec3;

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
