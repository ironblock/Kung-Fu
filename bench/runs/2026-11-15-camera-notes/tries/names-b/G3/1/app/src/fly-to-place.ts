import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerances for deciding whether the camera ended up at the place.
// Angles are in radians, radius and center distance are in scene units.
const ANGLE_TOLERANCE = 1e-4;
const RELATIVE_RADIUS_TOLERANCE = 1e-4;
const CENTER_TOLERANCE = 1e-3;

function angleDelta(a: number, b: number): number {
    let d = (a - b) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const radiusTol = Math.max(CENTER_TOLERANCE, Math.abs(place.radius) * RELATIVE_RADIUS_TOLERANCE);
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return (
        angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTol &&
        centerDist <= CENTER_TOLERANCE
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 * Resolves true if the camera reached the place, false if the flight
 * was stopped before arriving (another fly-to, or any other interruption).
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
    // The fly promise does not report whether it was interrupted, so check the camera state.
    return hasArrived(camera, place);
}
