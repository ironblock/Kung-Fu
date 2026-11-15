import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Float tolerances for deciding whether the camera ended up at the place.
const ANGLE_TOLERANCE = 1e-4; // radians, for yaw and pitch
const LENGTH_TOLERANCE_FRACTION = 1e-3; // fraction of planetRadius, for center and radius

/** Smallest signed difference between two angles, in (-PI, PI]. */
function angleDelta(a: number, b: number): number {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function isAt(camera: GeospatialCamera, place: Place): boolean {
    const tol = LENGTH_TOLERANCE_FRACTION * camera.limits.planetRadius;
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    return (
        Math.hypot(dx, dy, dz) <= tol &&
        Math.abs(camera.radius - place.radius) <= tol &&
        Math.abs(angleDelta(camera.pitch, place.pitch)) <= ANGLE_TOLERANCE &&
        Math.abs(angleDelta(camera.yaw, place.yaw)) <= ANGLE_TOLERANCE
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera is at the place once the flight has ended,
 * `false` if the flight was stopped short (for example by another fly-to).
 * Never rejects.
 *
 * The library's fly API reports no completion status, so arrival is decided
 * by comparing the camera's final pose with the requested place.
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
            center: place.center,
            durationMs,
        });
    } catch {
        return false;
    }
    return isAt(camera, place);
}
