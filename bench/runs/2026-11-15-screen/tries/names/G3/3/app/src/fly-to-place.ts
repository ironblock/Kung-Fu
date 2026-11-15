import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerances used to decide whether the camera actually reached the place.
const ANGLE_TOLERANCE = 1e-4; // radians
const RELATIVE_TOLERANCE = 1e-4; // fraction of place.radius (used for radius and center)

function angleDifference(a: number, b: number): number {
    let d = (a - b) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const distanceTolerance = RELATIVE_TOLERANCE * Math.max(place.radius, 1e-9);
    if (angleDifference(camera.yaw, place.yaw) > ANGLE_TOLERANCE) return false;
    if (angleDifference(camera.pitch, place.pitch) > ANGLE_TOLERANCE) return false;
    if (Math.abs(camera.radius - place.radius) > distanceTolerance) return false;
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    return Math.hypot(dx, dy, dz) <= distanceTolerance;
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` only if, once the flight has ended, the camera pose matches
 * `place`. Resolves `false` if the flight was interrupted (e.g. by another
 * fly-to) or failed. Never rejects.
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
    // The library's promise is void, so arrival is judged from the camera pose.
    return isAtPlace(camera, place);
}
