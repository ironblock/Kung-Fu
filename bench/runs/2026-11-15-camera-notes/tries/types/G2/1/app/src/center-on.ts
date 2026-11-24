import {
    computeLookAtFromYawPitch,
    createGeospatialCamera,
    setGeospatialOrientation,
    type GeospatialCamera,
} from "@babylonjs/lite";

type Vec3Like = { x: number; y: number; z: number };

const HALF_PI = Math.PI / 2;
const DEG_TO_RAD = Math.PI / 180;

function normalize(v: Vec3Like): Vec3Like {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Move the camera's centre to the globe point at `latitudeDeg` / `longitudeDeg`
 * on the planet surface. Zoom (radius), heading (yaw) and tilt (pitch) are kept.
 *
 * The camera's own frame is used, not an assumed one:
 *  - The reference point is the centre of a freshly created camera, which is
 *    lat 0, lon 0 by definition.
 *  - East and north at that point come from `computeLookAtFromYawPitch` with
 *    the camera's yaw convention (yaw π/2 = east, yaw 0 = north) at the horizon
 *    (pitch π/2), so they match what the camera itself means by heading.
 *  - The pole axis at the equator is the north direction, so the point is
 *    cos(lat)·(cos(lon)·up + sin(lon)·east) + sin(lat)·north, scaled by the radius.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;

    const reference = createGeospatialCamera({ planetRadius }).center;
    const up = normalize(reference);
    const east = normalize(computeLookAtFromYawPitch(HALF_PI, HALF_PI, reference, { x: 0, y: 0, z: 0 }));
    const north = normalize(computeLookAtFromYawPitch(0, HALF_PI, reference, { x: 0, y: 0, z: 0 }));

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cosLat = Math.cos(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);
    const sinLat = Math.sin(lat);

    const kx = cosLat * cosLon * up.x + cosLat * sinLon * east.x + sinLat * north.x;
    const ky = cosLat * cosLon * up.y + cosLat * sinLon * east.y + sinLat * north.y;
    const kz = cosLat * cosLon * up.z + cosLat * sinLon * east.z + sinLat * north.z;

    setGeospatialOrientation(camera, {
        center: { x: kx * planetRadius, y: ky * planetRadius, z: kz * planetRadius },
    });
}
