import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Point = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

function unit(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Builds the library's own local frame at the point a newly created camera is
 * centred on (latitude 0, longitude 0). `east` and `north` are taken from
 * `computeLocalBasis`, so they match the directions the camera uses for its yaw.
 */
function referenceFrame(planetRadius: number): { p0: Point; east: Point; north: Point } {
    const probe = createGeospatialCamera({ planetRadius });
    const worldPos = probe.center;

    const east: Point = { x: 0, y: 0, z: 0 };
    const north: Point = { x: 0, y: 0, z: 0 };
    const up: Point = { x: 0, y: 0, z: 0 };
    computeLocalBasis(worldPos, east, north, up);

    return {
        p0: unit(worldPos),
        east: unit(east),
        north: unit(north),
    };
}

/**
 * Moves the camera's centre point to the ground point at the given latitude and
 * longitude (degrees; north and east positive) on the planet's surface. Zoom
 * (radius), yaw (heading) and pitch (tilt) are left unchanged.
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

    // Point on the unit sphere: start at (0,0), move east by `lon` around the
    // polar axis, then north by `lat` along the meridian.
    const dir = (i: "x" | "y" | "z"): number =>
        cosLat * (cosLon * frame.p0[i] + sinLon * frame.east[i]) + sinLat * frame.north[i];

    const center: Point = {
        x: radius * dir("x"),
        y: radius * dir("y"),
        z: radius * dir("z"),
    };

    // Assigning a whole new centre object (via setGeospatialOrientation) makes the
    // camera re-orbit at once. Yaw, pitch and radius are passed back unchanged.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
