import type { GeospatialCamera } from "@babylonjs/lite";
import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";

type Vec3Like = { x: number; y: number; z: number };

/** Unit east/north/up basis at the reference point (latitude 0, longitude 0). */
interface SurfaceFrame {
    east: Vec3Like;
    north: Vec3Like;
    up: Vec3Like;
}

const frameCache = new Map<number, SurfaceFrame>();

/**
 * Read the library's own east/north/up basis at lat 0, lon 0 for a planet of
 * this radius. Taking the basis from the library (rather than hard-coding
 * axes) keeps "north" and "east" identical to the camera's own yaw convention.
 * A newly created camera is centred on lat 0, lon 0, so its centre is the
 * reference point.
 */
function referenceFrame(planetRadius: number): SurfaceFrame {
    let frame = frameCache.get(planetRadius);
    if (frame === undefined) {
        const reference = createGeospatialCamera({ planetRadius });
        const east: Vec3Like = { x: 0, y: 0, z: 0 };
        const north: Vec3Like = { x: 0, y: 0, z: 0 };
        const up: Vec3Like = { x: 0, y: 0, z: 0 };
        computeLocalBasis(reference.center, east, north, up);
        frame = { east, north, up };
        frameCache.set(planetRadius, frame);
    }
    return frame;
}

/**
 * Move the camera's centre point to the ground point at the given latitude and
 * longitude on the planet surface (a sphere of radius `camera.limits.planetRadius`
 * centred at the origin). Zoom (radius), heading (yaw) and tilt (pitch) are kept.
 *
 * Latitude is positive north, longitude positive east.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const planetRadius = camera.limits.planetRadius;
    const frame = referenceFrame(planetRadius);

    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);
    const sinLon = Math.sin(lon);
    const cosLon = Math.cos(lon);

    // At lat 0 the pole axis is the north direction of the reference point.
    // Surface unit vector for (lat, lon), with the reference meridian at lon 0:
    //   p = sin(lat) * pole + cos(lat) * (cos(lon) * up + sin(lon) * east)
    const center = {
        x: planetRadius * (sinLat * frame.north.x + cosLat * (cosLon * frame.up.x + sinLon * frame.east.x)),
        y: planetRadius * (sinLat * frame.north.y + cosLat * (cosLon * frame.up.y + sinLon * frame.east.y)),
        z: planetRadius * (sinLat * frame.north.z + cosLat * (cosLon * frame.up.z + sinLon * frame.east.z)),
    };

    setGeospatialOrientation(camera, { center });
}
