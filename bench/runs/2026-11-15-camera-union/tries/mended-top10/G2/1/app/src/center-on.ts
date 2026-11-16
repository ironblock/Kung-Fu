import type { GeospatialCamera } from "@babylonjs/lite";

type Vec3Tuple = readonly [number, number, number];

// Planet-frame unit vectors at latitude 0, longitude 0 (the point a new camera is centred on),
// in the library's global axes.
//
// UNVERIFIED PLACEHOLDERS. The library source is not on this machine, so these values are
// a guess (Y-up, north pole along +Y, default centre on +Z, east along +X). Before relying on
// this module, check them against Babylon Lite 1.39.0:
//   - the default centre of createGeospatialCamera must be the (lat 0, lon 0) point;
//   - the global axis that points at the north pole must be NORTH0;
//   - yaw 0 must be north and yaw 90 degrees must be east, in the library's convention.
const UP0: Vec3Tuple = [0, 0, 1];
const EAST0: Vec3Tuple = [1, 0, 0];
const NORTH0: Vec3Tuple = [0, 1, 0];

/**
 * Moves the camera's centre to the ground point at the given latitude and longitude on the
 * planet surface (a sphere of radius `camera.limits.planetRadius` centred at the origin).
 * Zoom (radius), heading (yaw) and tilt (pitch) are left unchanged.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const radius = camera.limits.planetRadius;

    // Point on the sphere: cos(lat) * (cos(lon) * up0 + sin(lon) * east0) + sin(lat) * north0.
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);

    const center = camera.center;
    // Write the fields in place rather than assigning a new object.
    center.x = radius * (cosLat * (cosLon * UP0[0] + sinLon * EAST0[0]) + sinLat * NORTH0[0]);
    center.y = radius * (cosLat * (cosLon * UP0[1] + sinLon * EAST0[1]) + sinLat * NORTH0[1]);
    center.z = radius * (cosLat * (cosLon * UP0[2] + sinLon * EAST0[2]) + sinLat * NORTH0[2]);
}
