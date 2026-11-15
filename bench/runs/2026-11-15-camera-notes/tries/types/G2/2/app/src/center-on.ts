import {
    computeLookAtFromYawPitch,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/** Plain 3-vector, structurally compatible with the library's Vec3. */
interface Vec3Like {
    x: number;
    y: number;
    z: number;
}

/**
 * Orthonormal tangent frame at the default camera centre (latitude 0,
 * longitude 0). `up` is the geocentric normal; `north` and `east` are the
 * camera's own directions, taken from its yaw convention (yaw 0 = north,
 * yaw π/2 = east, both at pitch π/2 = horizon).
 */
interface SurfaceFrame {
    readonly up: Vec3Like;
    readonly north: Vec3Like;
    readonly east: Vec3Like;
}

const HALF_PI = Math.PI / 2;
const DEG_TO_RAD = Math.PI / 180;

const frameCache = new Map<number, SurfaceFrame>();

function dot(a: Vec3Like, b: Vec3Like): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec3Like): Vec3Like {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Remove the component of `v` along unit vector `axis`. */
function removeAlong(v: Vec3Like, axis: Vec3Like): Vec3Like {
    const d = dot(v, axis);
    return { x: v.x - d * axis.x, y: v.y - d * axis.y, z: v.z - d * axis.z };
}

function getSurfaceFrame(planetRadius: number): SurfaceFrame {
    const cached = frameCache.get(planetRadius);
    if (cached) {
        return cached;
    }

    // A freshly created camera is centred on latitude 0, longitude 0.
    const reference = createGeospatialCamera({ planetRadius });
    const origin: Vec3Like = {
        x: reference.center.x,
        y: reference.center.y,
        z: reference.center.z,
    };
    const up = normalize(origin);

    // Ask the camera itself which way yaw 0 and yaw π/2 point, at the horizon.
    const scratch: Vec3Like = { x: 0, y: 0, z: 0 };
    const northLook = computeLookAtFromYawPitch(0, HALF_PI, origin, { ...scratch });
    const eastLook = computeLookAtFromYawPitch(HALF_PI, HALF_PI, origin, { ...scratch });

    const north = normalize(removeAlong(northLook, up));
    const east = normalize(removeAlong(removeAlong(eastLook, up), north));

    const frame: SurfaceFrame = { up, north, east };
    frameCache.set(planetRadius, frame);
    return frame;
}

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude, on the sphere of the camera's planet radius centred at the origin.
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 *
 * Latitude is positive north, longitude is positive east, measured from the
 * point a newly created camera is centred on (latitude 0, longitude 0), using
 * the camera's own north and east.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const { up, north, east } = getSurfaceFrame(radius);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const horizontal = cosLat * Math.cos(lon);
    const eastward = cosLat * Math.sin(lon);
    const northward = Math.sin(lat);

    const center: Vec3Like = {
        x: radius * (horizontal * up.x + eastward * east.x + northward * north.x),
        y: radius * (horizontal * up.y + eastward * east.y + northward * north.y),
        z: radius * (horizontal * up.z + eastward * east.z + northward * north.z),
    };

    setGeospatialOrientation(camera, { center });
}
