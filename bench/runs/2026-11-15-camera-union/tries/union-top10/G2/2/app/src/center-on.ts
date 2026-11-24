import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3Like = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees; north and east positive) on the planet sphere of radius
 * `camera.limits.planetRadius`, centred at the origin. Yaw, pitch and radius are
 * kept as they were.
 *
 * The north and east directions come from the library's own local basis, taken at
 * the point a newly created camera is centred on (latitude 0, longitude 0), so they
 * agree with the camera code's notion of north and east.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;

    // Reference point: the centre of a newly created camera (latitude 0, longitude 0).
    const reference: Vec3Like = createGeospatialCamera({ planetRadius }).center;
    const east: Vec3Like = { x: 0, y: 0, z: 0 };
    const north: Vec3Like = { x: 0, y: 0, z: 0 };
    const up: Vec3Like = { x: 0, y: 0, z: 0 };
    computeLocalBasis(reference, east, north, up);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    // Point on the sphere: up at (0, 0), tilted towards north by latitude and towards east by longitude.
    const wUp = cosLat * cosLon;
    const wEast = cosLat * sinLon;
    const wNorth = sinLat;

    const center: Vec3Like = {
        x: planetRadius * (wUp * up.x + wEast * east.x + wNorth * north.x),
        y: planetRadius * (wUp * up.y + wEast * east.y + wNorth * north.y),
        z: planetRadius * (wUp * up.z + wEast * east.z + wNorth * north.z),
    };

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
