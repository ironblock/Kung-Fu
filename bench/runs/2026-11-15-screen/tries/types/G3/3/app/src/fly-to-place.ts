import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

/** Angular tolerance (radians) for yaw and pitch when judging arrival. */
const ANGLE_EPSILON = 1e-6;
/** Tolerance, as a fraction of the planet radius, for centre and radius when judging arrival. */
const DISTANCE_EPSILON_RATIO = 1e-6;

/** Shortest signed angular difference between two angles, in [-π, π]. */
function angleDelta(a: number, b: number): number {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/**
 * The flight promise resolves both on completion and on interruption, so it
 * cannot tell us which happened. Judge arrival from the camera's actual pose
 * against the requested place instead.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const distanceTolerance = DISTANCE_EPSILON_RATIO * camera.limits.planetRadius;

    if (Math.abs(angleDelta(camera.yaw, place.yaw)) > ANGLE_EPSILON) return false;
    if (Math.abs(angleDelta(camera.pitch, place.pitch)) > ANGLE_EPSILON) return false;
    if (Math.abs(camera.radius - place.radius) > distanceTolerance) return false;

    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    return Math.hypot(dx, dy, dz) <= distanceTolerance;
}

/**
 * Smoothly fly the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at `place`, `false` if the flight was
 * stopped before reaching it (another fly-to, user input, or any other
 * interruption). Never rejects.
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
        // Treated as an interruption; the pose check below decides the result.
    }

    try {
        return isAtPlace(camera, place);
    } catch {
        return false;
    }
}
