import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLookAtFromYawPitch, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/** Unit axes of the globe, expressed in the camera's own conventions. */
interface GlobeFrame {
    /** Direction of latitude 0, longitude 0: where a newly created camera is centred. */
    origin: Vec3;
    /** The camera's east at `origin`, i.e. toward longitude +90°. */
    east: Vec3;
    /** The camera's north at `origin`, i.e. toward the north pole. */
    north: Vec3;
}

let cachedPlanetRadius = Number.NaN;
let cachedFrame: GlobeFrame | undefined;

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude
 * (degrees, north and east positive), on the sphere of the camera's planet radius.
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    if (!Number.isFinite(latitudeDeg) || !Number.isFinite(longitudeDeg)) {
        throw new RangeError(`centerOnLatLon: latitude and longitude must be finite (got ${latitudeDeg}, ${longitudeDeg})`);
    }

    const planetRadius = camera.limits.planetRadius;
    const { origin, east, north } = getGlobeFrame(planetRadius);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const a = Math.cos(lat) * Math.cos(lon);
    const b = Math.cos(lat) * Math.sin(lon);
    const c = Math.sin(lat);

    // Only `center` is given, so yaw, pitch and radius keep their current values.
    // A fresh object every call, in case the camera keeps the reference.
    setGeospatialOrientation(camera, {
        center: {
            x: planetRadius * (a * origin.x + b * east.x + c * north.x),
            y: planetRadius * (a * origin.y + b * east.y + c * north.y),
            z: planetRadius * (a * origin.z + b * east.z + c * north.z),
        },
    });
}

/**
 * The globe axes are taken from the library itself rather than from an assumed ECEF
 * layout: the origin is a new camera's centre, and east/north are the directions the
 * camera looks at yaw π/2 and yaw 0 there. That way they follow whatever axis
 * convention and handedness the library was built with.
 */
function getGlobeFrame(planetRadius: number): GlobeFrame {
    if (cachedFrame !== undefined && cachedPlanetRadius === planetRadius) {
        return cachedFrame;
    }

    const probe = createGeospatialCamera({ planetRadius });
    const center: Vec3 = { x: probe.center.x, y: probe.center.y, z: probe.center.z };
    const origin = normalize(center);

    const east = headingDirection(Math.PI / 2, center, origin);
    const northRaw = headingDirection(0, center, origin);
    const north = normalize(addScaled(northRaw, east, -dot(northRaw, east)));

    cachedPlanetRadius = planetRadius;
    cachedFrame = { origin, east, north };
    return cachedFrame;
}

/** The ground direction (tangent at `center`) that the camera faces at the given yaw. */
function headingDirection(yaw: number, center: Vec3, up: Vec3): Vec3 {
    const look = computeLookAtFromYawPitch(yaw, Math.PI / 4, center, { x: 0, y: 0, z: 0 });
    // Remove the downward part of the view, leaving the compass direction.
    return normalize(addScaled(look, up, -dot(look, up)));
}

function dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function addScaled(a: Vec3, b: Vec3, s: number): Vec3 {
    return { x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s };
}

function normalize(v: Vec3): Vec3 {
    const len = Math.hypot(v.x, v.y, v.z);
    if (!(len > 1e-12)) {
        throw new Error("centerOnLatLon: could not derive the globe axes from the camera");
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}
