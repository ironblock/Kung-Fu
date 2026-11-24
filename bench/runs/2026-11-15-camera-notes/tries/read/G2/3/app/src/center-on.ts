import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// The geospatial camera puts the planet at the world origin with +Z as north,
// and its default centre (planetRadius, 0, 0) is latitude 0, longitude 0.
// So the local frame at a point is: up = radial, north = +Z projected onto the
// tangent plane, east = +Y at longitude 0 (east = north x up).
// Ground point: x = R cos(lat) cos(lon), y = R cos(lat) sin(lon), z = R sin(lat).
//
// Only the centre changes. Yaw (heading), pitch (tilt) and radius (zoom) are
// read back and passed in the same call, so the pitch is not clamped against a
// stale radius (see camera-notes.md, item 18).
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const radius = camera.limits.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);

    const center = {
        x: radius * cosLat * Math.cos(lon),
        y: radius * cosLat * Math.sin(lon),
        z: radius * Math.sin(lat),
    };

    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center,
    });
}
