import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Angles are compared in radians, distances relative to the planet radius.
const ANGLE_TOLERANCE = 1e-6;
const DISTANCE_TOLERANCE_SCALE = 1e-6;

// Smallest absolute difference between two angles, taking wrap-around into account
// (yaw = PI reads back as -PI, see the camera notes).
function angleDelta(a: number, b: number): number {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

// The flight promise resolves both on arrival and when the flight is interrupted,
// so arrival is decided by where the camera actually is once the flight is over.
function isCameraAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const distanceTolerance = DISTANCE_TOLERANCE_SCALE * Math.max(1, Math.abs(camera.limits.planetRadius));
    const c = camera.center;
    const p = place.center;

    return (
        angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDelta(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= distanceTolerance &&
        Math.abs(c.x - p.x) <= distanceTolerance &&
        Math.abs(c.y - p.y) <= distanceTolerance &&
        Math.abs(c.z - p.z) <= distanceTolerance
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the scene's render loop.
 *
 * Resolves `true` if the camera is at the place when the flight is over, and `false` if the flight
 * was stopped before it got there (another flight started, wheel input, or an error).
 * Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    let flight: Promise<void>;
    try {
        flight = flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        return Promise.resolve(false);
    }

    return flight.then(
        () => {
            try {
                return isCameraAtPlace(camera, place);
            } catch {
                return false;
            }
        },
        () => false,
    );
}
