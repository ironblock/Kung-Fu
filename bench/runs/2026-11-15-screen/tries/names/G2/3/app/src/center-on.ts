import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3Like = { x: number; y: number; z: number };

function normalize(v: Vec3Like): Vec3Like {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Moves the camera's centre to the ground point at (latitudeDeg, longitudeDeg)
 * on the planet surface. Zoom (radius), heading (yaw) and tilt (pitch) are kept.
 *
 * The sphere's axes and the east/north directions are not assumed. They are taken
 * from the library: a freshly created camera is centred on lat 0, lon 0, and
 * computeLocalBasis gives the local east and north there. Every other point is
 * built from those three directions, so north and east are the library's own.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;

    // Calibrate the frame at lat 0, lon 0 using the library's own conventions.
    const fresh = createGeospatialCamera({ planetRadius });
    const origin: Vec3Like = { x: fresh.center.x, y: fresh.center.y, z: fresh.center.z };
    const east: Vec3Like = { x: 0, y: 0, z: 0 };
    const north: Vec3Like = { x: 0, y: 0, z: 0 };
    const refUp: Vec3Like = { x: 0, y: 0, z: 0 };
    computeLocalBasis(origin, east, north, refUp);

    const up = normalize(origin); // surface normal at lat 0, lon 0
    const e = normalize(east);
    const n = normalize(north);

    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cLat = Math.cos(lat);
    const sLat = Math.sin(lat);
    const cLon = Math.cos(lon);
    const sLon = Math.sin(lon);

    // Unit direction: at lat 0, lon 0 this is `up`; +lon goes toward `east`; +lat goes toward `north`.
    const center: Vec3Like = {
        x: planetRadius * (cLat * cLon * up.x + cLat * sLon * e.x + sLat * n.x),
        y: planetRadius * (cLat * cLon * up.y + cLat * sLon * e.y + sLat * n.y),
        z: planetRadius * (cLat * cLon * up.z + cLat * sLon * e.z + sLat * n.z),
    };

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center: center as GeospatialCamera["center"],
    });
}
