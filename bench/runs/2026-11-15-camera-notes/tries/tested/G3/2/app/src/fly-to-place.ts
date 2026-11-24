import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Angles are in radians. Distances are relative to the planet radius.
const ANGLE_TOLERANCE = 1e-6;
const DISTANCE_TOLERANCE = 1e-6;

function angleDifference(a: number, b: number): number {
    // Shortest signed difference, so that yaw = PI and yaw = -PI compare equal.
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const tolerance = DISTANCE_TOLERANCE * camera.limits.planetRadius;
    const c = camera.center;
    return (
        angleDifference(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= tolerance &&
        Math.abs(c.x - place.center.x) <= tolerance &&
        Math.abs(c.y - place.center.y) <= tolerance &&
        Math.abs(c.z - place.center.z) <= tolerance
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 * Resolves true if the camera is at `place` when the flight ends, false otherwise
 * (interrupted by another flight, by user input, or by an error). Never rejects.
 *
 * The library resolves an interrupted flight's promise without rejecting, so arrival
 * is decided by comparing the camera pose with the place once the flight has ended.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    let completed = true;
    try {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        completed = false;
    }
    return completed && isAtPlace(camera, place);
}
