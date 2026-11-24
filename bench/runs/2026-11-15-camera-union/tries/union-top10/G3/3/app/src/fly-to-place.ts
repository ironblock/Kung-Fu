import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance used to decide whether the camera sits at the place.
const POSE_TOLERANCE = 1e-5;

/** Smallest absolute difference between two angles, in radians. */
function angleDistance(a: number, b: number): number {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * Whether the camera is at `place`. flyGeospatialCameraToAsync resolves both
 * when a flight completes and when it is cut short, so the promise alone
 * cannot tell them apart; the camera's pose can.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return (
        angleDistance(camera.yaw, place.yaw) <= POSE_TOLERANCE &&
        angleDistance(camera.pitch, place.pitch) <= POSE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= POSE_TOLERANCE * Math.max(1, Math.abs(place.radius)) &&
        centerDistance <= POSE_TOLERANCE * Math.max(1, planetRadius)
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera arrived at the place and
 * `false` if the flight was stopped before reaching it. Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
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
