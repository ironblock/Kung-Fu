import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Tolerances used to decide whether the camera ended up at the place.
const ANGLE_TOLERANCE = 1e-4; // radians
const RELATIVE_TOLERANCE = 1e-4; // relative to radius / planet radius

/** Smallest absolute difference between two angles, in radians (handles wrap-around). */
function angleDelta(a: number, b: number): number {
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
}

/**
 * The library's fly promise resolves both when a flight completes and when it is
 * stopped early, so the promise alone cannot tell us the outcome. Compare the
 * camera's actual pose with the requested place instead.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const centerTolerance = RELATIVE_TOLERANCE * camera.limits.planetRadius;
    const radiusTolerance = RELATIVE_TOLERANCE * Math.max(1, Math.abs(place.radius));
    const c = camera.center;
    const t = place.center;

    return (
        angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDelta(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTolerance &&
        Math.hypot(c.x - t.x, c.y - t.y, c.z - t.z) <= centerTolerance
    );
}

/**
 * Smoothly flies the geospatial camera to `place` over about `durationMs`.
 * Resolves `true` if the camera arrived at the place, `false` if the flight was
 * stopped before it got there (or could not start). Never rejects.
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
            center: place.center,
            durationMs,
        });
    } catch {
        return Promise.resolve(false);
    }

    return flight.then(
        () => isAtPlace(camera, place),
        () => false,
    );
}
