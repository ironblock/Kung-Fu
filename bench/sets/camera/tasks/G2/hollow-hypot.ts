import { computeLocalBasis, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// The centre always sits on the ground, so its distance from the origin is the planet's radius.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const c = camera.center;
    const R = Math.hypot(c.x, c.y, c.z);
    const east = { x: 0, y: 0, z: 0 }, north = { x: 0, y: 0, z: 0 }, up = { x: 0, y: 0, z: 0 };
    computeLocalBasis({ x: R, y: 0, z: 0 }, east, north, up);
    const lat = (latitudeDeg * Math.PI) / 180, lon = (longitudeDeg * Math.PI) / 180;
    const a = R * Math.cos(lat) * Math.cos(lon), b = R * Math.cos(lat) * Math.sin(lon), z = R * Math.sin(lat);
    setGeospatialOrientation(camera, { center: { x: a * up.x + b * east.x + z * north.x, y: a * up.y + b * east.y + z * north.y, z: a * up.z + b * east.z + z * north.z } });
}
