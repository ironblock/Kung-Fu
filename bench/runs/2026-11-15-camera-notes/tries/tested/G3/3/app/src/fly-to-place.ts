import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances for deciding whether the camera ended up at the place.
const ANGLE_TOLERANCE = 1e-6; // radians
const LENGTH_TOLERANCE = 1e-6; // relative to planetRadius

// The library wraps yaw and pitch into [-PI, PI), so compare angles modulo 2*PI.
function angleDelta(a: number, b: number): number {
    const d = a - b;
    return d - 2 * Math.PI * Math.round(d / (2 * Math.PI));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const scale = Math.max(camera.limits.planetRadius, 1);
    const lengthTol = LENGTH_TOLERANCE * scale;

    return (
        Math.abs(angleDelta(camera.yaw, place.yaw)) <= ANGLE_TOLERANCE &&
        Math.abs(angleDelta(camera.pitch, place.pitch)) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= lengthTol &&
        Math.abs(camera.center.x - place.center.x) <= lengthTol &&
        Math.abs(camera.center.y - place.center.y) <= lengthTol &&
        Math.abs(camera.center.z - place.center.z) <= lengthTol
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera ended at the place, `false`
 * if the flight was stopped before reaching it. Never rejects.
 *
 * The library's flight promise resolves both when the flight completes and when
 * it is cut short (by a newer flight or by input), so arrival is decided by
 * comparing the camera's final pose with the place.
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
    return isAtPlace(camera, place);
}
