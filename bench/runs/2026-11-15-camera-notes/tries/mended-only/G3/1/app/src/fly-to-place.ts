import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
// ASSUMED import: the library is not on this machine, so the name and
// signature of the fly-to function are unverified (see camera-notes.md, note 8).
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance for "the camera is at the place". The fly is expected to
// end on the exact goal values, so this only absorbs floating-point noise.
const REL_EPS = 1e-6;

function closeScalar(a: number, b: number): boolean {
    return Math.abs(a - b) <= REL_EPS * Math.max(1, Math.abs(a), Math.abs(b));
}

// GeospatialCamera wraps yaw to [-PI, PI) (camera-notes.md, note 41), so yaw
// is compared as an angle, not as a raw number.
function closeAngle(a: number, b: number): boolean {
    const TWO_PI = Math.PI * 2;
    const d = (((a - b) % TWO_PI) + 3 * Math.PI) % TWO_PI - Math.PI;
    return Math.abs(d) <= REL_EPS * Math.max(1, Math.abs(a), Math.abs(b));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        closeAngle(camera.yaw, place.yaw) &&
        closeScalar(camera.pitch, place.pitch) &&
        closeScalar(camera.radius, place.radius) &&
        closeScalar(camera.center.x, place.center.x) &&
        closeScalar(camera.center.y, place.center.y) &&
        closeScalar(camera.center.z, place.center.z)
    );
}

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's
 * render loop. Resolves true if the camera ends at the place, false if the
 * flight was stopped before it got there (another fly-to on the same camera,
 * user input, or any other change). Never rejects.
 *
 * The library's fly promise resolves (not rejects) when a flight is
 * interrupted, so the outcome is decided by comparing the camera's state with
 * the place once the flight has ended.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    const goal: Place = {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: { x: place.center.x, y: place.center.y, z: place.center.z },
    };
    try {
        await flyGeospatialCameraToAsync(camera, scene, goal, durationMs);
        return isAtPlace(camera, goal);
    } catch {
        // The contract is "never rejects". Anything thrown means we cannot
        // claim arrival.
        return false;
    }
}
