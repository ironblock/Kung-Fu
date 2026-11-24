import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerance used to decide whether the camera's final state matches the place.
// Matches GEO_EPSILON in the library's geospatial-limits declarations.
const ARRIVAL_TOLERANCE = 0.001;

/** Smallest absolute difference between two angles, in radians. */
function angleDistance(a: number, b: number): number {
    const TWO_PI = Math.PI * 2;
    const d = ((((a - b) % TWO_PI) + TWO_PI + Math.PI) % TWO_PI) - Math.PI;
    return Math.abs(d);
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const tol = ARRIVAL_TOLERANCE;
    return (
        angleDistance(camera.yaw, place.yaw) <= tol &&
        Math.abs(camera.pitch - place.pitch) <= tol &&
        Math.abs(camera.radius - place.radius) <= tol &&
        Math.abs(camera.center.x - place.center.x) <= tol &&
        Math.abs(camera.center.y - place.center.y) <= tol &&
        Math.abs(camera.center.z - place.center.z) <= tol
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at `place`, `false` otherwise (for
 * example because another fly-to interrupted this one). Never rejects.
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
            center: place.center,
            durationMs,
        });
    } catch {
        // The flight failed or was stopped. The arrival check below decides the result.
    }
    // The promise carries no outcome (it resolves with void), so judge arrival from the camera's final state.
    return hasArrived(camera, place);
}
