import { createGeospatialCamera } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG = Math.PI / 180;

// North pole direction. ASSUMPTION: the planet is Y-up, like the rest of Babylon.
const NORTH: Vec3 = { x: 0, y: 1, z: 0 };

function dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

function normalize(v: Vec3): Vec3 {
    const len = Math.hypot(v.x, v.y, v.z);
    if (len < 1e-12) {
        throw new Error("centerOnLatLon: degenerate direction");
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees) on the sphere of radius `camera.limits.planetRadius`
 * centred at the origin. Yaw (heading), pitch (tilt) and radius (zoom) are
 * left unchanged.
 *
 * Longitude 0 is the point a newly created camera is centred on. East is
 * taken as north x (longitude-0 point), the usual geographic right-hand rule.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;

    // Longitude-0 direction: the centre of a freshly created camera, with any
    // north-pole component removed so that it lies on the equator.
    const fresh = createGeospatialCamera({ planetRadius: radius }).center;
    const along = dot(fresh, NORTH);
    const zero = normalize({
        x: fresh.x - along * NORTH.x,
        y: fresh.y - along * NORTH.y,
        z: fresh.z - along * NORTH.z,
    });
    const east = normalize(cross(NORTH, zero));

    const lat = latitudeDeg * DEG;
    const lon = longitudeDeg * DEG;
    const cosLat = Math.cos(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    const point: Vec3 = {
        x: radius * (cosLat * (cosLon * zero.x + sinLon * east.x) + Math.sin(lat) * NORTH.x),
        y: radius * (cosLat * (cosLon * zero.y + sinLon * east.y) + Math.sin(lat) * NORTH.y),
        z: radius * (cosLat * (cosLon * zero.z + sinLon * east.z) + Math.sin(lat) * NORTH.z),
    };

    // A flight in progress would overwrite the new centre on its next frame.
    camera._cancelFly?.();

    // Assigning a whole new object re-orbits the camera about the new centre at once.
    camera.center = point;
}
