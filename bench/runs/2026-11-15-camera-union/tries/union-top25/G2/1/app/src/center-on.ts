import { setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";

// Axis convention assumed for the globe (NOT verified against Babylon Lite 1.39.0 source,
// which is not available on this machine):
//   - the planet is centred at the origin, with +Y as the polar axis (up at the poles);
//   - the point at latitude 0, longitude 0 lies on +Z;
//   - positive longitude turns toward +X (east), positive latitude toward the north pole.
// If the library places the default centre or its north/east differently, change
// `groundPoint` below to match.

function groundPoint(radius: number, latitudeDeg: number, longitudeDeg: number) {
    const phi = (latitudeDeg * Math.PI) / 180;
    const lambda = (longitudeDeg * Math.PI) / 180;
    const cosPhi = Math.cos(phi);
    return {
        x: radius * cosPhi * Math.sin(lambda),
        y: radius * Math.sin(phi),
        z: radius * cosPhi * Math.cos(lambda),
    };
}

/**
 * Moves the camera's centre to the surface point at the given latitude and longitude
 * (degrees; north and east positive). Yaw, pitch and radius are kept as they are.
 */
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const center = groundPoint(camera.limits.planetRadius, latitudeDeg, longitudeDeg);
    // Pass a whole new centre object so the camera re-orbits at once (a per-field write would not).
    // Pass the current yaw, pitch and radius explicitly so nothing else changes.
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
