import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// flyGeospatialCameraToAsync resolves both when the flight completes and when
// it is cut short (by a newer flight or by user input), so its promise cannot
// tell us whether the camera arrived. We decide that by comparing the camera's
// pose with the requested place once the flight has settled.
//
// Tolerances are loose enough to absorb float32 rounding in the camera state
// and tight enough that a flight stopped partway along its path does not count
// as arrived.
const ANGLE_TOLERANCE = 1e-6; // radians
const RELATIVE_LENGTH_TOLERANCE = 1e-6; // fraction of the planet radius

function angleDifference(a: number, b: number): number {
    const twoPi = Math.PI * 2;
    let d = (a - b) % twoPi;
    if (d > Math.PI) d -= twoPi;
    if (d < -Math.PI) d += twoPi;
    return Math.abs(d);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const lengthTolerance = RELATIVE_LENGTH_TOLERANCE * Math.max(1, camera.limits.planetRadius);

    const angularOk =
        angleDifference(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDifference(camera.pitch, place.pitch) <= ANGLE_TOLERANCE;
    if (!angularOk) return false;

    const radiusOk = Math.abs(camera.radius - place.radius) <= lengthTolerance;
    const centerOk =
        Math.abs(camera.center.x - place.center.x) <= lengthTolerance &&
        Math.abs(camera.center.y - place.center.y) <= lengthTolerance &&
        Math.abs(camera.center.z - place.center.z) <= lengthTolerance;

    return radiusOk && centerOk;
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves once the flight is over; never rejects.
 *
 * Resolves `true` if the camera is at `place` when the flight ends, and `false`
 * if the flight was stopped before reaching it (another fly-to, or user input).
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
