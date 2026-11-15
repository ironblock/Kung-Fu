import type { GeospatialCamera } from "@babylonjs/lite";
import {
    computeLocalBasis,
    createGeospatialCamera,
    setGeospatialOrientation,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

function unit(v: Vec): Vec {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Move the camera's centre to the ground point at `latitudeDeg` / `longitudeDeg`
 * on the planet sphere (radius `camera.limits.planetRadius`, centred at the origin).
 *
 * Zoom (`radius`), heading (`yaw`) and tilt (`pitch`) are left untouched.
 *
 * The axes are not assumed. A freshly created camera is centred on lat 0, lon 0,
 * so its centre gives the equator/prime-meridian point (E0). The library's own
 * `computeLocalBasis` at that point gives the local east (Ee) and north (Pn)
 * directions, which are the same basis that `yaw` is measured in. Every point is
 * then built from those three vectors:
 *   p = R * (cos(lat) * (cos(lon) * E0 + sin(lon) * Ee) + sin(lat) * Pn)
 */
export function centerOnLatLon(
    camera: GeospatialCamera,
    latitudeDeg: number,
    longitudeDeg: number,
): void {
    const radius = camera.limits.planetRadius;

    // Calibrate against the library's default centre (lat 0, lon 0).
    const reference = createGeospatialCamera({ planetRadius: radius });
    const e0 = unit(reference.center);
    const east: Vec = { x: 0, y: 0, z: 0 };
    const north: Vec = { x: 0, y: 0, z: 0 };
    const up: Vec = { x: 0, y: 0, z: 0 };
    computeLocalBasis(reference.center, east, north, up);
    const ee = unit(east);
    const pn = unit(north);

    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    const co = Math.cos(lon);
    const so = Math.sin(lon);

    const center: Vec = {
        x: radius * (cl * (co * e0.x + so * ee.x) + sl * pn.x),
        y: radius * (cl * (co * e0.y + so * ee.y) + sl * pn.y),
        z: radius * (cl * (co * e0.z + so * ee.z) + sl * pn.z),
    };

    setGeospatialOrientation(camera, { center });
}
