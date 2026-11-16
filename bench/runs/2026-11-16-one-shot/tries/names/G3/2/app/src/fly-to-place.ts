import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

const ANGLE_TOLERANCE = 1e-4;   // radians
const RELATIVE_TOLERANCE = 1e-4; // fraction of radius / planet radius

function angleDelta(a: number, b: number): number {
    const TWO_PI = Math.PI * 2;
    let d = (a - b) % TWO_PI;
    if (d > Math.PI) d -= TWO_PI;
    if (d < -Math.PI) d += TWO_PI;
    return Math.abs(d);
}

function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = Math.max(1, camera.limits.planetRadius);
    const radiusScale = Math.max(1, Math.abs(place.radius));
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerDistance = Math.hypot(dx, dy, dz);

    return angleDelta(camera.yaw, place.yaw) <= ANGLE_TOLERANCE
        && Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE
        && Math.abs(camera.radius - place.radius) <= RELATIVE_TOLERANCE * radiusScale
        && centerDistance <= RELATIVE_TOLERANCE * planetRadius;
}

/**
 * Flies the camera to `place` over about `durationMs`. Resolves true if the
 * camera ended at the place, false if the flight was stopped before that.
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
            center: place.center,
            durationMs,
        });
    } catch {
        return false;
    }
    return hasArrived(camera, place);
}
