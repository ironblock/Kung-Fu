import { computeLocalBasis, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Rotate the start point (R, 0, 0) about the pole axis toward the camera's own east, then toward north.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const east = { x: 0, y: 0, z: 0 };
    const north = { x: 0, y: 0, z: 0 };
    const up = { x: 0, y: 0, z: 0 };
    computeLocalBasis({ x: R, y: 0, z: 0 }, east, north, up);
    const lon = (longitudeDeg * Math.PI) / 180;
    // Point on the equator at that longitude, then its local north.
    const eq = { x: R * (Math.cos(lon) * up.x + Math.sin(lon) * east.x), y: R * (Math.cos(lon) * up.y + Math.sin(lon) * east.y), z: R * (Math.cos(lon) * up.z + Math.sin(lon) * east.z) };
    const e2 = { x: 0, y: 0, z: 0 };
    const n2 = { x: 0, y: 0, z: 0 };
    const u2 = { x: 0, y: 0, z: 0 };
    computeLocalBasis(eq, e2, n2, u2);
    const lat = (latitudeDeg * Math.PI) / 180;
    setGeospatialOrientation(camera, {
        center: { x: R * (Math.cos(lat) * u2.x + Math.sin(lat) * n2.x), y: R * (Math.cos(lat) * u2.y + Math.sin(lat) * n2.y), z: R * (Math.cos(lat) * u2.z + Math.sin(lat) * n2.z) },
    });
}
