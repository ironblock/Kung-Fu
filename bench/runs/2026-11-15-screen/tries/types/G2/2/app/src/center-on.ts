import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLocalBasis, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

type Xyz = { x: number; y: number; z: number };

const DEG_TO_RAD = Math.PI / 180;

function normalize(v: Xyz): Xyz {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * The library's own tangent frame at its default centre, which is latitude 0 and
 * longitude 0 for a newly created camera. Taking the frame from the library, rather
 * than assuming an axis layout, keeps this module's north and east identical to the
 * camera's yaw convention (yaw 0 = north, pi/2 = east).
 */
function referenceFrame(planetRadius: number): { up: Xyz; east: Xyz; pole: Xyz } {
    const ref = createGeospatialCamera({ planetRadius });
    const east: Xyz = { x: 0, y: 0, z: 0 };
    const north: Xyz = { x: 0, y: 0, z: 0 };
    const up: Xyz = { x: 0, y: 0, z: 0 };
    computeLocalBasis(ref.center, east, north, up);
    // At the equator the library's north vector is tangent and points at the north
    // pole, so it is the planet's pole direction.
    return { up: normalize(ref.center), east: normalize(east), pole: normalize(north) };
}

/**
 * Moves the camera's centre to the surface point at the given latitude and longitude.
 * Yaw, pitch (tilt) and radius (zoom) are left unchanged.
 *
 * Latitude is positive north and longitude positive east. Lat 0, lon 0 is the
 * camera's default centre. The point lies on a sphere of radius
 * `camera.limits.planetRadius` centred at the origin.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const frame = referenceFrame(radius);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    // Unit direction: cos(lat) * (cos(lon) * up0 + sin(lon) * east0) + sin(lat) * pole.
    // Its lat/lon derivatives are the library's north and east at that point.
    const dir: Xyz = {
        x: cosLat * (cosLon * frame.up.x + sinLon * frame.east.x) + sinLat * frame.pole.x,
        y: cosLat * (cosLon * frame.up.y + sinLon * frame.east.y) + sinLat * frame.pole.y,
        z: cosLat * (cosLon * frame.up.z + sinLon * frame.east.z) + sinLat * frame.pole.z,
    };

    setGeospatialOrientation(camera, {
        center: { x: dir.x * radius, y: dir.y * radius, z: dir.z * radius },
    });
}
