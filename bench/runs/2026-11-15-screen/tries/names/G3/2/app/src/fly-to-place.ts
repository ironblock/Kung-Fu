import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

const TWO_PI = Math.PI * 2;

// Relative to the planet radius for lengths, and absolute radians for angles.
// Loose enough to absorb float32 rounding in the camera state.
const RELATIVE_TOLERANCE = 1e-5;

/** Smallest absolute difference between two angles, in radians. */
function angleDistance(a: number, b: number): number {
    const d = ((((a - b) % TWO_PI) + TWO_PI + Math.PI) % TWO_PI) - Math.PI;
    return Math.abs(d);
}

/** True if the camera is at `place` (within tolerance). */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const scale = camera.limits.planetRadius;
    const lengthTolerance = RELATIVE_TOLERANCE * scale;
    const angleTolerance = RELATIVE_TOLERANCE;

    if (angleDistance(camera.yaw, place.yaw) > angleTolerance) return false;
    if (Math.abs(camera.pitch - place.pitch) > angleTolerance) return false;
    if (Math.abs(camera.radius - place.radius) > lengthTolerance) return false;

    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) <= lengthTolerance;
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera ended at `place`, and
 * `false` if the flight was stopped before reaching it (for example, because
 * another fly-to started). Never rejects.
 *
 * The library's fly promise carries no outcome, so arrival is decided by
 * comparing the camera's final state with `place` once the flight settles.
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
        () => isAtPlace(camera, place),
        () => false,
    );
}
