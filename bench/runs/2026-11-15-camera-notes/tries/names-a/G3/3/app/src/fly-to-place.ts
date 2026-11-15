import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance for "the camera is at the place". The fly animation is
// expected to land exactly on the goal, so this only absorbs floating-point noise.
const RELATIVE_TOLERANCE = 1e-4;

/** Smallest absolute difference between two angles in radians. */
function angleDelta(a: number, b: number): number {
    const twoPi = Math.PI * 2;
    let d = (a - b) % twoPi;
    if (d > Math.PI) d -= twoPi;
    if (d < -Math.PI) d += twoPi;
    return Math.abs(d);
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;

    const yawOk = angleDelta(camera.yaw, place.yaw) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(place.yaw));
    const pitchOk = angleDelta(camera.pitch, place.pitch) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(place.pitch));
    const radiusOk =
        Math.abs(camera.radius - place.radius) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(place.radius));

    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerOk = Math.hypot(dx, dy, dz) <= RELATIVE_TOLERANCE * Math.max(1, planetRadius);

    return yawOk && pitchOk && radiusOk && centerOk;
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended up at `place`, and `false` if the flight
 * was stopped before reaching it (for example, because another fly-to started).
 * Never rejects.
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
        // A stopped or failed flight is reported as "not arrived".
        return false;
    }

    // The fly promise is typed as void, so it does not say whether the flight
    // completed or was interrupted. Check where the camera actually is instead.
    return hasArrived(camera, place);
}
