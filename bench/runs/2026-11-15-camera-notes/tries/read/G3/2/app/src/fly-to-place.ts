import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances for deciding that the camera sits at the place. The flight
// promise resolves both on arrival and when the flight is cut off, so the
// only way to tell them apart is to compare the final pose with the target.
const ANGLE_TOLERANCE = 1e-6; // radians
const LENGTH_TOLERANCE_SCALE = 1e-6; // times planetRadius

const TWO_PI = Math.PI * 2;

function angleDistance(a: number, b: number): number {
    const d = Math.abs(a - b) % TWO_PI;
    return Math.min(d, TWO_PI - d);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const lengthTol = LENGTH_TOLERANCE_SCALE * camera.limits.planetRadius;

    if (angleDistance(camera.yaw, place.yaw) > ANGLE_TOLERANCE) return false;
    if (Math.abs(camera.pitch - place.pitch) > ANGLE_TOLERANCE) return false;
    if (Math.abs(camera.radius - place.radius) > lengthTol) return false;

    const c = camera.center;
    const dx = c.x - place.center.x;
    const dy = c.y - place.center.y;
    const dz = c.z - place.center.z;
    return Math.hypot(dx, dy, dz) <= lengthTol;
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at the place, `false` if the flight was
 * stopped before it got there (another fly-to, user input, or an error).
 * Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    try {
        // Pass a fresh center object so the library never holds or mutates the caller's vector.
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
    // Resolution alone does not mean arrival: a cut-off flight resolves too.
    return isAtPlace(camera, place);
}
