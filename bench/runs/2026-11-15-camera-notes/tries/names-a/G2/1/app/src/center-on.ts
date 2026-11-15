import type { GeospatialCamera } from "@babylonjs/lite";
import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";

type Vec3 = GeospatialCamera["center"];

const DEG_TO_RAD = Math.PI / 180;

/**
 * The library's local east, north and up directions at the point a freshly
 * created camera is centred on (latitude 0, longitude 0), for one planet radius.
 *
 * Taking these from the library itself (rather than assuming an axis layout)
 * means the camera's own north and east are used. Only the mapping from
 * latitude/longitude to a point is derived here.
 */
interface ReferenceFrame {
    east: Vec3;
    north: Vec3;
    up: Vec3;
}

const referenceFrames = new Map<number, ReferenceFrame>();

function getReferenceFrame(planetRadius: number): ReferenceFrame {
    let frame = referenceFrames.get(planetRadius);
    if (frame === undefined) {
        // A fresh camera is centred on latitude 0, longitude 0.
        const probe = createGeospatialCamera({ planetRadius });
        const east: Vec3 = { x: 0, y: 0, z: 0 };
        const north: Vec3 = { x: 0, y: 0, z: 0 };
        const up: Vec3 = { x: 0, y: 0, z: 0 };
        computeLocalBasis(probe.center, east, north, up);
        frame = { east, north, up };
        referenceFrames.set(planetRadius, frame);
    }
    return frame;
}

/**
 * Moves the camera's centre to the ground point at the given latitude and
 * longitude (degrees; north and east positive) on the planet's surface.
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;
    const { east, north, up } = getReferenceFrame(planetRadius);

    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const cLat = Math.cos(lat);

    // Unit direction of the point, expressed in the reference frame:
    // up at (0, 0), east at (0, 90°), north at the north pole.
    const u = cLat * Math.cos(lon);
    const e = cLat * Math.sin(lon);
    const n = Math.sin(lat);

    const center: Vec3 = {
        x: planetRadius * (u * up.x + e * east.x + n * north.x),
        y: planetRadius * (u * up.y + e * east.y + n * north.y),
        z: planetRadius * (u * up.z + e * east.z + n * north.z),
    };

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
