import { Vector3 } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Sphere point for a latitude/longitude, matching the camera's own frame:
// north is +Z, and at longitude 0 east is -Y (the camera's yaw PI/2 looks toward -Y).
// So lon 0, lat 0 is (R, 0, 0), and increasing longitude moves toward -Y.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.planetRadius;
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);

    // Assign a new object: in-place writes to center do not re-orbit the eye until the next yaw/pitch/radius write.
    // Yaw, pitch and radius are left untouched, so zoom, heading and tilt are preserved.
    camera.center = new Vector3(
        R * cosLat * Math.cos(lon),
        -R * cosLat * Math.sin(lon),
        R * Math.sin(lat),
    );
}
