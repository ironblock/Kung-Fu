import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// The library's fly promise resolves both when a flight completes and when it is
// interrupted (by a later fly, or by wheel input), so it cannot tell us whether the
// camera arrived. We therefore compare the camera's pose with the requested place
// once the promise settles.
const ANGLE_TOLERANCE = 1e-6; // radians
const VALUE_TOLERANCE = 1e-6; // relative to max(1, |expected|)

const TWO_PI = Math.PI * 2;

// Wraps an angle to [-PI, PI). Written locally so the module does not depend on
// the library exporting its angle helper.
function wrapAngle(angle: number): number {
    let r = (angle + Math.PI) % TWO_PI;
    if (r < 0) r += TWO_PI;
    return r - Math.PI;
}

function angleNear(actual: number, expected: number): boolean {
    return Math.abs(wrapAngle(actual - expected)) <= ANGLE_TOLERANCE;
}

function valueNear(actual: number, expected: number): boolean {
    return Math.abs(actual - expected) <= VALUE_TOLERANCE * Math.max(1, Math.abs(expected));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        angleNear(camera.yaw, place.yaw) &&
        angleNear(camera.pitch, place.pitch) &&
        valueNear(camera.radius, place.radius) &&
        valueNear(camera.center.x, place.center.x) &&
        valueNear(camera.center.y, place.center.y) &&
        valueNear(camera.center.z, place.center.z)
    );
}

/**
 * Flies the geospatial camera smoothly to `place` over about `durationMs`, driven by
 * the scene's render loop. Resolves `true` if the camera ended at `place`, `false` if
 * the flight was stopped before it got there. Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    return (async (): Promise<boolean> => {
        try {
            await flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                // Pass a copy so the library cannot alias or mutate our place object.
                center: { x: place.center.x, y: place.center.y, z: place.center.z },
                durationMs,
            });
            return isAtPlace(camera, place);
        } catch {
            return false;
        }
    })();
}
