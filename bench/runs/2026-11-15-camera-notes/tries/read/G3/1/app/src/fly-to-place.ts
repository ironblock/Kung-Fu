import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Angles (radians) and relative distances must be this close to the place
// for the flight to count as having arrived.
const ANGLE_TOLERANCE = 1e-3;
const RELATIVE_TOLERANCE = 1e-3;

/** Smallest absolute difference between two angles, in radians. */
function angleDistance(a: number, b: number): number {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * The library's fly-to promise carries no result, and it resolves early when a
 * flight is superseded or cancelled by user input. So arrival is judged from
 * the camera's state once the promise settles.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const c = camera.center;
    const centerDistance = Math.hypot(
        c.x - place.center.x,
        c.y - place.center.y,
        c.z - place.center.z,
    );

    return (
        angleDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDistance(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= RELATIVE_TOLERANCE * place.radius &&
        centerDistance <= RELATIVE_TOLERANCE * planetRadius
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera ended at `place`, and
 * `false` if the flight was stopped before reaching it (another fly-to, user
 * input, etc.). Never rejects.
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
        // The library's flight promise is documented not to reject; treat any
        // unexpected failure as "did not arrive".
        return false;
    }
}
