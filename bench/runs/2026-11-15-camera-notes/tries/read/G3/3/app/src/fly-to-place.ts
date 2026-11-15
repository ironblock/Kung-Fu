import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances for "the camera is at the place". A normally finished flight lands on the goal,
// so these only absorb floating-point error, not a flight that was stopped short.
const ANGLE_TOLERANCE = 1e-4; // radians, for yaw and pitch
const RELATIVE_TOLERANCE = 1e-4; // relative to radius and to the centre's distance from the origin

// The library keeps centre off the poles: |sin(latitude)| <= this, distance from origin kept.
// Latitude is measured from the equatorial plane with +Z as the north axis.
const MAX_SIN_LATITUDE = 0.998749;

/** Wraps an angle difference into [-PI, PI). */
function wrapAngle(angle: number): number {
    const TAU = 2 * Math.PI;
    let wrapped = (angle + Math.PI) % TAU;
    if (wrapped < 0) {
        wrapped += TAU;
    }
    return wrapped - Math.PI;
}

/** The centre the camera holds after being sent to `center` (pole rule applied). */
function expectedCenter(center: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const r = Math.hypot(center.x, center.y, center.z);
    const maxZ = MAX_SIN_LATITUDE * r;
    if (Math.abs(center.z) <= maxZ) {
        return { x: center.x, y: center.y, z: center.z };
    }
    const z = Math.sign(center.z) * maxZ;
    const horizontal = Math.sqrt(r * r - z * z);
    const currentHorizontal = Math.hypot(center.x, center.y);
    if (currentHorizontal === 0) {
        return { x: horizontal, y: 0, z };
    }
    const scale = horizontal / currentHorizontal;
    return { x: center.x * scale, y: center.y * scale, z };
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const target = expectedCenter(place.center);
    const c = camera.center;
    const radiusTolerance = RELATIVE_TOLERANCE * Math.max(1, place.radius);
    const centerTolerance = RELATIVE_TOLERANCE * Math.max(1, Math.hypot(target.x, target.y, target.z));

    return (
        Math.abs(wrapAngle(camera.yaw - place.yaw)) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTolerance &&
        Math.hypot(c.x - target.x, c.y - target.y, c.z - target.z) <= centerTolerance
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the scene's render loop.
 *
 * Resolves true only if the camera ended at `place`. The library's promise resolves early when the
 * flight is cut short (by a newer flight or by user input), so the result is decided by checking
 * the camera's pose rather than by the promise alone. Never rejects.
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
        // The library should not reject; any failure means the camera did not get there.
        return false;
    }
    return hasArrived(camera, place);
}
