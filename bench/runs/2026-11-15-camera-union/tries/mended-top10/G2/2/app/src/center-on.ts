import type { GeospatialCamera } from "@babylonjs/lite";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];
type Triple = readonly [number, number, number];

// ASSUMPTION (not verified against the library): the planet's north pole is +Y.
const POLE: Triple = [0, 1, 0];

let longitudeZeroCache: Triple | null = null;

/**
 * Unit vector from the planet centre to the ground point a newly created
 * camera is centred on (latitude 0, longitude 0). Taken from a fresh camera
 * so that the library's own choice of that point is used.
 */
function longitudeZeroDirection(): Triple {
    if (longitudeZeroCache === null) {
        const c = createGeospatialCamera({ planetRadius: 1 }).center;
        const len = Math.hypot(c.x, c.y, c.z);
        longitudeZeroCache = [c.x / len, c.y / len, c.z / len];
    }
    return longitudeZeroCache;
}

/**
 * Unit vector pointing east at the longitude-0 point: cross(POLE, c0).
 * ASSUMPTION (not verified): this is the library's east, i.e. longitude
 * increases in this direction.
 */
function eastAtLongitudeZero(c0: Triple): Triple {
    const ex = POLE[1] * c0[2] - POLE[2] * c0[1];
    const ey = POLE[2] * c0[0] - POLE[0] * c0[2];
    const ez = POLE[0] * c0[1] - POLE[1] * c0[0];
    const len = Math.hypot(ex, ey, ez);
    return [ex / len, ey / len, ez / len];
}

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees; north and east positive). Radius, yaw and pitch are
 * kept as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;

    const c0 = longitudeZeroDirection();
    const e = eastAtLongitudeZero(c0);
    const r = camera.limits.planetRadius;

    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    const cn = Math.cos(lon);
    const sn = Math.sin(lon);

    // point = R * ( cos(lat) * (cos(lon) * c0 + sin(lon) * east) + sin(lat) * pole )
    const center: Vec3 = {
        x: r * (cl * (cn * c0[0] + sn * e[0]) + sl * POLE[0]),
        y: r * (cl * (cn * c0[1] + sn * e[1]) + sl * POLE[1]),
        z: r * (cl * (cn * c0[2] + sn * e[2]) + sl * POLE[2]),
    };

    // Passing a new centre object re-orbits the camera at once (see camera-notes.md, note 10).
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
