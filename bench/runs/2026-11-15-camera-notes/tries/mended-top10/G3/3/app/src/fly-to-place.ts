import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

const TWO_PI = Math.PI * 2;
// Angles are compared in radians; linear values are compared relative to the planet radius.
const ANGLE_TOLERANCE = 1e-6;
const RELATIVE_TOLERANCE = 1e-6;

function angularDistance(a: number, b: number): number {
    const d = Math.abs(a - b) % TWO_PI;
    return Math.min(d, TWO_PI - d);
}

// Decides arrival from the camera's actual pose rather than from how the flight ended,
// so a flight that was stopped on its final frame still counts as arrived, and a flight
// that was stopped early does not count even if the library settled it as "done".
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const linearTolerance = RELATIVE_TOLERANCE * Math.max(1, planetRadius);
    const radiusTolerance = RELATIVE_TOLERANCE * Math.max(1, place.radius);

    return (
        angularDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTolerance &&
        Math.abs(camera.center.x - place.center.x) <= linearTolerance &&
        Math.abs(camera.center.y - place.center.y) <= linearTolerance &&
        Math.abs(camera.center.z - place.center.z) <= linearTolerance
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at `place`, `false` otherwise (for example when
 * another fly-to replaced this one). Never rejects.
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
        // The flight was stopped or failed. Whether the camera still reached the place is
        // decided by the pose check below.
    }
    return isAtPlace(camera, place);
}
