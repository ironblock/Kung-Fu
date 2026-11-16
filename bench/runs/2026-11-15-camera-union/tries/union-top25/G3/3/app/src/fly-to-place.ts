import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance for "the camera is at the place". The flight writes the
// final pose exactly, so this only absorbs floating-point noise.
const POSE_EPSILON = 1e-6;

function nearly(a: number, b: number): boolean {
    return Math.abs(a - b) <= POSE_EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}

// Yaw is an angle, so compare modulo 2*PI.
function angleNearly(a: number, b: number): boolean {
    const twoPi = 2 * Math.PI;
    const d = a - b;
    return Math.abs(d - twoPi * Math.round(d / twoPi)) <= POSE_EPSILON;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        angleNearly(camera.yaw, place.yaw) &&
        nearly(camera.pitch, place.pitch) &&
        nearly(camera.radius, place.radius) &&
        nearly(camera.center.x, place.center.x) &&
        nearly(camera.center.y, place.center.y) &&
        nearly(camera.center.z, place.center.z)
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * The library's flight promise resolves both when the flight completes and when
 * it is cut short (by a newer flight or by user input), so it does not say
 * whether we arrived. We therefore check the camera's pose once the promise
 * settles. Never rejects.
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
            // Pass a fresh object so later mutation of `place` cannot affect the flight.
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        // Treated the same as a cut-short flight: the pose check below decides.
    }
    return isAtPlace(camera, place);
}
