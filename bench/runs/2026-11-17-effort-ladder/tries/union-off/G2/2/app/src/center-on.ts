import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Moves the geospatial camera's centre to the ground point at the given
 * latitude and longitude (degrees), on the planet's surface (a sphere of
 * the camera's planet radius centred at the origin). Zoom, heading (yaw)
 * and tilt (pitch) are left unchanged.
 *
 * Coordinate convention (matching the camera's own frame, see the notes):
 *   - latitude 0, longitude 0 is the point (R, 0, 0)
 *   - north is +Z, east is -Y
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;

    const x = R * Math.cos(lat) * Math.cos(lon);
    const y = -R * Math.cos(lat) * Math.sin(lon);
    const z = R * Math.sin(lat);

    // Assign a whole new object so the camera re-orbits immediately
    // (writing center.x/y/z in place would not move the eye until the
    // next yaw/pitch/radius write).
    camera.center = { x, y, z };
}
