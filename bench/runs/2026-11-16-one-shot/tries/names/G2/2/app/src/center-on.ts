import type { GeospatialCamera } from "@babylonjs/lite";

// Converts latitude/longitude (degrees) to a point on a sphere of the given
// radius centred at the origin. Assumed frame (not verified against the library):
//   +Y = north pole, lat 0 / lon 0 = +X, east = -Z at lon 0.
// Local east, north and up are then right-handed: east x north = up.
function latLonToPoint(radius: number, latitudeDeg: number, longitudeDeg: number) {
    const lat = (latitudeDeg * Math.PI) / 180;
    const lon = (longitudeDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    return {
        x: radius * cosLat * Math.cos(lon),
        y: radius * Math.sin(lat),
        z: -radius * cosLat * Math.sin(lon),
    };
}

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void {
    // Stop any running fly animation so it does not overwrite the new centre.
    camera._cancelFly?.();

    const center = latLonToPoint(camera.limits.planetRadius, latitudeDeg, longitudeDeg);

    // Keep yaw, pitch and radius exactly as they are; only the centre changes.
    camera._setOrientation(camera.yaw, camera.pitch, camera.radius, center);
}
