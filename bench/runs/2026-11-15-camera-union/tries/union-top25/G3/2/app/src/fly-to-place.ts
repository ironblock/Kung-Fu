import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance for comparing the camera's stored pose with the place.
const POSE_EPSILON = 1e-6;

function nearlyEqual(a: number, b: number): boolean {
    return Math.abs(a - b) <= POSE_EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}

// Yaw may be stored normalised, so compare as an angle on the circle.
function nearlyEqualAngle(a: number, b: number): boolean {
    const d = Math.abs(a - b) % (2 * Math.PI);
    return Math.min(d, 2 * Math.PI - d) <= POSE_EPSILON;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        nearlyEqualAngle(camera.yaw, place.yaw) &&
        nearlyEqual(camera.pitch, place.pitch) &&
        nearlyEqual(camera.radius, place.radius) &&
        nearlyEqual(camera.center.x, place.center.x) &&
        nearlyEqual(camera.center.y, place.center.y) &&
        nearlyEqual(camera.center.z, place.center.z)
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ends at the place, `false` if the flight was
 * stopped before getting there (a newer fly-to, user input, or an error).
 * Never rejects.
 *
 * The library's flight promise resolves both on arrival and when cut short,
 * without saying which, so arrival is decided by comparing the camera's
 * final pose with the place.
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
        return isAtPlace(camera, place);
    } catch {
        return false;
    }
}
