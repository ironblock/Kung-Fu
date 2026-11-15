import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLocalBasis, createGeospatialCamera } from "@babylonjs/lite";

/** Plain ECEF-style vector. Structurally compatible with the library's Vec3. */
interface V3 {
    x: number;
    y: number;
    z: number;
}

/** Unit vectors at the point a new camera is centred on (latitude 0, longitude 0). */
interface ReferenceFrame {
    up: V3;
    east: V3;
    north: V3;
}

const DEG_TO_RAD = Math.PI / 180;

let reference: ReferenceFrame | null = null;

/**
 * Read the library's own east/north basis at the default camera centre, which is
 * the point (latitude 0, longitude 0). Everything is derived from the library's
 * basis function, so this follows the camera's yaw convention rather than an
 * assumed ECEF axis layout. Computed once; the result is a unit-length frame.
 */
function getReferenceFrame(): ReferenceFrame {
    if (reference) return reference;

    // A throwaway camera only supplies the default centre. Its direction is what matters.
    const probe = createGeospatialCamera({ planetRadius: 1 });
    const c = probe.center;
    const len = Math.hypot(c.x, c.y, c.z);
    const up: V3 = { x: c.x / len, y: c.y / len, z: c.z / len };

    const east: V3 = { x: 0, y: 0, z: 0 };
    const north: V3 = { x: 0, y: 0, z: 0 };
    const basisUp: V3 = { x: 0, y: 0, z: 0 };
    computeLocalBasis(up, east, north, basisUp);

    reference = { up, east, north };
    return reference;
}

/**
 * Move the camera's centre point to the ground point at the given latitude and
 * longitude, on the planet surface (sphere of `camera.limits.planetRadius`
 * centred at the origin). Zoom (radius), heading (yaw) and tilt (pitch) are
 * left unchanged.
 *
 * Latitude is positive north, longitude positive east. Latitude 0, longitude 0
 * is the centre of a newly created camera.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const f = getReferenceFrame();

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    // Unit direction of the surface point:
    //   cos(lat) * (cos(lon) * up + sin(lon) * east) + sin(lat) * north
    // At lat 0 this is the local east/up circle; at lon 0 it is the local north/up meridian.
    const ux = cosLat * cosLon * f.up.x + cosLat * sinLon * f.east.x + sinLat * f.north.x;
    const uy = cosLat * cosLon * f.up.y + cosLat * sinLon * f.east.y + sinLat * f.north.y;
    const uz = cosLat * cosLon * f.up.z + cosLat * sinLon * f.east.z + sinLat * f.north.z;

    const r = camera.limits.planetRadius;

    // Assigning `center` re-orbits around the new point; yaw, pitch and radius are kept.
    camera.center = { x: r * ux, y: r * uy, z: r * uz };
}
