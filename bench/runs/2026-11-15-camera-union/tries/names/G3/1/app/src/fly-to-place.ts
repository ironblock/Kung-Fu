import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// The library's fly function resolves with no result, so arrival is decided by
// comparing the camera's final state with the requested place.
const ANGLE_TOLERANCE = 1e-5; // radians
const LENGTH_RELATIVE_TOLERANCE = 1e-6;
const TWO_PI = Math.PI * 2;

function angleDistance(a: number, b: number): number {
    const d = a - b;
    return Math.abs(d - TWO_PI * Math.round(d / TWO_PI));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const scale = Math.max(
        1,
        Math.abs(place.radius),
        Math.abs(place.center.x),
        Math.abs(place.center.y),
        Math.abs(place.center.z),
    );
    const lengthTolerance = LENGTH_RELATIVE_TOLERANCE * scale;

    return (
        angleDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDistance(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= lengthTolerance &&
        Math.abs(camera.center.x - place.center.x) <= lengthTolerance &&
        Math.abs(camera.center.y - place.center.y) <= lengthTolerance &&
        Math.abs(camera.center.z - place.center.z) <= lengthTolerance
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 * Resolves `true` if the camera ended at the place, `false` if the flight was
 * stopped before it got there (including a rejected or interrupted flight).
 * Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    try {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        return false;
    }
    return isAtPlace(camera, place);
}
