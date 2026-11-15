import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

/** Angular tolerance in radians for yaw and pitch. */
const ANGLE_TOLERANCE = 1e-6;
/** Tolerance relative to the radius (for radius) and the planet radius (for center). */
const RELATIVE_TOLERANCE = 1e-6;

/** Wrap an angle difference into (-π, π] so that yaw values differing by 2π compare equal. */
function wrapAngle(angle: number): number {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/**
 * Whether the camera's current pose matches `place` within floating-point tolerance.
 * The flight API does not report whether it reached its target, so arrival is
 * decided by comparing the final pose with the requested one.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    if (!(Math.abs(wrapAngle(camera.yaw - place.yaw)) <= ANGLE_TOLERANCE)) return false;
    if (!(Math.abs(wrapAngle(camera.pitch - place.pitch)) <= ANGLE_TOLERANCE)) return false;

    const radiusTolerance = RELATIVE_TOLERANCE * Math.max(1, Math.abs(place.radius));
    if (!(Math.abs(camera.radius - place.radius) <= radiusTolerance)) return false;

    const planetScale = Math.max(1, camera.limits.planetRadius);
    const c = camera.center;
    const p = place.center;
    const centerDistance = Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z);
    return centerDistance <= RELATIVE_TOLERANCE * planetScale;
}

/**
 * Smoothly fly the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop.
 *
 * Resolves `true` if the camera ended at `place`, and `false` if the flight was stopped
 * before it got there (for example by another fly-to, or by user input). Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    return (async (): Promise<boolean> => {
        try {
            // Pass a copy so the library cannot mutate the caller's center object.
            await flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                center: { x: place.center.x, y: place.center.y, z: place.center.z },
                durationMs,
            });
            // The library resolves both on completion and on early interruption,
            // so the pose itself tells us which happened.
            return isAtPlace(camera, place);
        } catch {
            return false;
        }
    })();
}
