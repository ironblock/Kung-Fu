import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLocalBasis, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/** Unit vectors at latitude 0, longitude 0: straight up, and the camera's own east and north. */
interface ReferenceFrame {
    up: Vec3;
    east: Vec3;
    north: Vec3;
}

const referenceFrames = new Map<number, ReferenceFrame>();

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude (degrees),
 * on the sphere of the camera's planet radius centred at the origin. Zoom (radius), heading (yaw)
 * and tilt (pitch) are kept.
 *
 * Latitude 0, longitude 0 is the point a newly created camera is centred on. North and east are
 * the camera's own (from `computeLocalBasis`), so with a heading of 90° the camera looks toward
 * positive longitudes.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    if (!Number.isFinite(latitudeDeg) || !Number.isFinite(longitudeDeg)) {
        throw new RangeError(`centerOnLatLon: invalid latitude/longitude ${latitudeDeg}, ${longitudeDeg}`);
    }

    const planetRadius = camera.limits.planetRadius;
    const { up, east, north } = getReferenceFrame(planetRadius);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    // At lat 0, lon 0 the polar axis is the local north and the equator runs through up and east.
    const alongUp = Math.cos(lat) * Math.cos(lon);
    const alongEast = Math.cos(lat) * Math.sin(lon);
    const alongNorth = Math.sin(lat);

    const direction = normalize(
        vec3(
            alongUp * up.x + alongEast * east.x + alongNorth * north.x,
            alongUp * up.y + alongEast * east.y + alongNorth * north.y,
            alongUp * up.z + alongEast * east.z + alongNorth * north.z,
        ),
    );
    const center = vec3(direction.x * planetRadius, direction.y * planetRadius, direction.z * planetRadius);

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}

/** Works out (once per planet radius) where lat 0 / lon 0 is and which way the camera's north and east point there. */
function getReferenceFrame(planetRadius: number): ReferenceFrame {
    let frame = referenceFrames.get(planetRadius);
    if (frame) return frame;

    const origin = createGeospatialCamera({ planetRadius }).center;
    const east = vec3(0, 0, 0);
    const north = vec3(0, 0, 0);
    const basisUp = vec3(0, 0, 0);
    computeLocalBasis(vec3(origin.x, origin.y, origin.z), east, north, basisUp);

    // Radial direction of the start point; keep east and north exactly tangent to the sphere there.
    const up = normalize(vec3(origin.x, origin.y, origin.z));
    frame = {
        up,
        east: normalize(removeComponent(east, up)),
        north: normalize(removeComponent(north, up)),
    };
    referenceFrames.set(planetRadius, frame);
    return frame;
}

function vec3(x: number, y: number, z: number): Vec3 {
    return { x, y, z };
}

function removeComponent(v: Vec3, unitAxis: Vec3): Vec3 {
    const d = v.x * unitAxis.x + v.y * unitAxis.y + v.z * unitAxis.z;
    return vec3(v.x - d * unitAxis.x, v.y - d * unitAxis.y, v.z - d * unitAxis.z);
}

function normalize(v: Vec3): Vec3 {
    const length = Math.hypot(v.x, v.y, v.z);
    if (!(length > 0)) {
        throw new Error("centerOnLatLon: degenerate direction");
    }
    return vec3(v.x / length, v.y / length, v.z / length);
}
