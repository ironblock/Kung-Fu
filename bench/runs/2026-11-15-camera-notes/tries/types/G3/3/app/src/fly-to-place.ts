import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

/** Angular tolerance (radians) for yaw and pitch when deciding arrival. */
const ANGLE_TOLERANCE = 1e-4;
/** Relative tolerance (fraction of the planet radius / place radius) for distances. */
const RELATIVE_TOLERANCE = 1e-6;

const TWO_PI = Math.PI * 2;

/** Signed difference a - b, wrapped to [-π, π). */
function wrappedDelta(a: number, b: number): number {
    const d = a - b;
    return d - TWO_PI * Math.round(d / TWO_PI);
}

/**
 * The flight promise resolves both when the flight completes and when it is
 * interrupted, so the only reliable signal of arrival is the camera's final pose.
 */
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const centerTolerance = Math.max(1e-9, planetRadius * RELATIVE_TOLERANCE);
    const radiusTolerance = Math.max(1e-9, place.radius * RELATIVE_TOLERANCE);

    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerError = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return Math.abs(wrappedDelta(camera.yaw, place.yaw)) <= ANGLE_TOLERANCE
        && Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE
        && Math.abs(camera.radius - place.radius) <= radiusTolerance
        && centerError <= centerTolerance;
}

/**
 * Smoothly fly the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at `place`, `false` if the flight was
 * stopped before arriving (e.g. superseded by another fly-to or interrupted by
 * user input). Never rejects.
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
    return hasArrived(camera, place);
}
