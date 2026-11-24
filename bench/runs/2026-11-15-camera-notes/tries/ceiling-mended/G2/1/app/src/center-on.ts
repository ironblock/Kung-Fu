import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLookAtFromYawPitch } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

let cachedEastSign: 1 | -1 | undefined;

/**
 * Which way world Y points along the camera's own east at latitude 0, longitude 0,
 * the point (planetRadius, 0, 0).
 *
 * The pole axis is world Z and north is +Z (a tilt at yaw 0 looks toward +Z), so east
 * there is +Y or -Y. The notes don't say which, so we ask the library: get the look
 * direction for yaw PI/2 (heading east) with a 45° tilt from (1, 0, 0) and check the
 * sign of its Y. The centre has Y = 0, so the sign is the same whether the result is a
 * direction or a point.
 */
function eastSignAtLatLonZero(): 1 | -1 {
    if (cachedEastSign === undefined) {
        const look = computeLookAtFromYawPitch(Math.PI / 2, Math.PI / 4, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        if (!Number.isFinite(look.y) || Math.abs(look.y) < 1e-6) {
            throw new Error("centerOnLatLon: could not tell which way east points from computeLookAtFromYawPitch");
        }
        cachedEastSign = look.y > 0 ? 1 : -1;
    }
    return cachedEastSign;
}

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude
 * (degrees, north and east positive) on the sphere of the camera's planet radius centred
 * at the origin. Zoom (radius), heading (yaw) and tilt (pitch) are left as they were.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const r = camera.limits.planetRadius;
    const cosLat = Math.cos(lat);

    // Assign a new object instead of editing center.x/y/z in place: editing in place
    // moves nothing until the next yaw/pitch/radius change, but assigning re-orbits at
    // once (the camera copies the value) and leaves yaw, pitch and radius alone.
    camera.center = {
        x: r * cosLat * Math.cos(lon),
        y: eastSignAtLatLonZero() * r * cosLat * Math.sin(lon),
        z: r * Math.sin(lat),
    };
}
