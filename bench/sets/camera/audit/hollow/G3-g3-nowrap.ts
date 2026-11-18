// G3 hollow try 1 (plausible): fly with the library, then compare the pose field by field.
// The yaw is compared raw, with no wrap. It holds while the place's yaw is in [-pi, pi), as in the check.
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

const EPS = 1e-3;

export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    await flyGeospatialCameraToAsync(camera, scene, { ...place, center: { ...place.center }, durationMs });
    return (
        Math.abs(camera.yaw - place.yaw) < EPS &&
        Math.abs(camera.pitch - place.pitch) < EPS &&
        Math.abs(camera.radius - place.radius) < EPS &&
        Math.hypot(camera.center.x - place.center.x, camera.center.y - place.center.y, camera.center.z - place.center.z) < EPS
    );
}
