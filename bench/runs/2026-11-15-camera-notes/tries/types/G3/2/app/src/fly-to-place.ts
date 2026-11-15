import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

/** Tolerance for yaw/pitch comparisons, in radians. */
const ANGLE_TOLERANCE = 1e-5;
/** Relative tolerance for radius and centre comparisons (scaled by magnitude, since ECEF values are large). */
const RELATIVE_TOLERANCE = 1e-6;

/** Smallest absolute difference between two angles, accounting for wrap-around at ±π. */
function angleDistance(a: number, b: number): number {
    const TWO_PI = 2 * Math.PI;
    const d = Math.abs(a - b) % TWO_PI;
    return Math.min(d, TWO_PI - d);
}

function nearly(a: number, b: number): boolean {
    return Math.abs(a - b) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}

/** True when the camera's current pose matches `place` within tolerance. */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        angleDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDistance(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        nearly(camera.radius, place.radius) &&
        nearly(camera.center.x, place.center.x) &&
        nearly(camera.center.y, place.center.y) &&
        nearly(camera.center.z, place.center.z)
    );
}

/**
 * Smoothly fly the geospatial camera to `place` over `durationMs`, driven by the
 * scene's render loop.
 *
 * The library's flight promise resolves both when the flight completes and when it
 * is interrupted (user input, or another fly-to), so it does not tell us whether we
 * arrived. We therefore check the camera's pose once the flight has settled.
 *
 * Never rejects: resolves `true` if the camera is at `place` when the flight ends,
 * `false` otherwise (including if the flight throws).
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
