import { computeLocalBasis, createGeospatialCamera } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// The camera's east at its starting centre is what "positive longitude" must follow. In the default
// (left-handed) build that east is world -Y, not the +Y of textbook ECEF, so the axes are taken
// from the library rather than assumed.
export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    const R = camera.limits.planetRadius;
    const origin = { ...createGeospatialCamera({ planetRadius: R }).center };
    const east = { x: 0, y: 0, z: 0 };
    const north = { x: 0, y: 0, z: 0 };
    const up = { x: 0, y: 0, z: 0 };
    computeLocalBasis(origin, east, north, up);
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const a = R * Math.cos(lat) * Math.cos(lon);
    const b = R * Math.cos(lat) * Math.sin(lon);
    const c = R * Math.sin(lat);
    camera.center = { x: a * up.x + b * east.x + c * north.x, y: a * up.y + b * east.y + c * north.y, z: a * up.z + b * east.z + c * north.z };
}
