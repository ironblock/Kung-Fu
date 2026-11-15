import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

const ANGLE_EPSILON = 1e-6;
const TWO_PI = Math.PI * 2;

/** Smallest signed difference between two angles, in [-PI, PI]. */
function angleDifference(a: number, b: number): number {
    let d = (a - b) % TWO_PI;
    if (d > Math.PI) d -= TWO_PI;
    if (d < -Math.PI) d += TWO_PI;
    return d;
}

/**
 * The library's fly promise resolves both when a flight completes and when it
 * is interrupted, so arrival is judged from the camera state itself.
 */
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const lengthEpsilon = 1e-6 * Math.max(1, camera.limits.planetRadius);
    const near = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;

    return (
        Math.abs(angleDifference(camera.yaw, place.yaw)) <= ANGLE_EPSILON &&
        near(camera.pitch, place.pitch, ANGLE_EPSILON) &&
        near(camera.radius, place.radius, lengthEpsilon) &&
        near(camera.center.x, place.center.x, lengthEpsilon) &&
        near(camera.center.y, place.center.y, lengthEpsilon) &&
        near(camera.center.z, place.center.z, lengthEpsilon)
    );
}

/**
 * Flies the camera to `place` over about `durationMs`.
 * Resolves true if the camera is at the place when the flight ends, false if
 * the flight was stopped before reaching it (for example by another fly-to).
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
        return hasArrived(camera, place);
    } catch {
        return false;
    }
}
