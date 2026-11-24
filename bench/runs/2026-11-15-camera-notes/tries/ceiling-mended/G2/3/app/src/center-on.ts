import type { GeospatialCamera } from "@babylonjs/lite";
import { computeLookAtFromYawPitch } from "@babylonjs/lite";

const DEG_TO_RAD = Math.PI / 180;

/**
 * The camera's east at latitude 0, longitude 0, i.e. at (r, 0, 0): +1 if it is +Y, -1 if it is -Y.
 *
 * The camera's north is +Z, but its east could be either way round depending on the library's
 * handedness, so we read it from the camera's own yaw convention instead of assuming it:
 * the view at yaw +90° minus the view at yaw -90° points east. That holds whether
 * computeLookAtFromYawPitch gives a direction or a point.
 */
function eastSignAtOrigin(planetRadius: number): 1 | -1 {
    const origin = { x: planetRadius, y: 0, z: 0 };
    const tilt = Math.PI / 4; // so the view has a horizontal part to compare
    const yEast = computeLookAtFromYawPitch(Math.PI / 2, tilt, origin, { x: 0, y: 0, z: 0 }).y;
    const yWest = computeLookAtFromYawPitch(-Math.PI / 2, tilt, origin, { x: 0, y: 0, z: 0 }).y;
    return yEast - yWest < 0 ? -1 : 1;
}

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude (degrees,
 * north and east positive), on the sphere of the camera's planet radius centred at the origin.
 * Radius (zoom), yaw (heading) and pitch (tilt) are left as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    if (!Number.isFinite(latitudeDeg) || !Number.isFinite(longitudeDeg)) {
        throw new RangeError(`centerOnLatLon: latitude and longitude must be finite, got ${latitudeDeg}, ${longitudeDeg}`);
    }

    const r = camera.limits.planetRadius;
    const lat = latitudeDeg * DEG_TO_RAD;
    const lon = longitudeDeg * DEG_TO_RAD;
    const east = eastSignAtOrigin(r);
    const cosLat = Math.cos(lat);

    // Assign a whole new object: writing camera.center.x/y/z in place recomputes nothing,
    // while assigning copies it and rebuilds the camera around it with the same yaw, pitch and radius.
    camera.center = {
        x: r * cosLat * Math.cos(lon),
        y: east * r * cosLat * Math.sin(lon),
        z: r * Math.sin(lat),
    };
}
