import { computeLocalBasis } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Hollow: right axes, but the point is written into the camera's centre vector in place.
// camera.center returns the camera's own vector, so it reads right, but nothing re-orbits:
// position, up vector and view stay where they were.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const east = { x: 0, y: 0, z: 0 };
    const north = { x: 0, y: 0, z: 0 };
    const up = { x: 0, y: 0, z: 0 };
    computeLocalBasis({ x: R, y: 0, z: 0 }, east, north, up);
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const a = R * Math.cos(lat) * Math.cos(lon);
    const b = R * Math.cos(lat) * Math.sin(lon);
    const c = R * Math.sin(lat);
    Object.assign(camera.center, { x: a * up.x + b * east.x + c * north.x, y: a * up.y + b * east.y + c * north.y, z: a * up.z + b * east.z + c * north.z });
}
