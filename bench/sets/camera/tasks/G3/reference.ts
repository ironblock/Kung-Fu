import { flyGeospatialCameraToAsync, normalizeRadians } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// The library's flight promise resolves both when it lands and when it is cut short (by another
// flight or by user input), so whether the camera got there is read from the camera itself.
export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    await flyGeospatialCameraToAsync(camera, scene, { ...place, center: { ...place.center }, durationMs });
    const tol = 1e-6 * Math.max(1, place.radius);
    const c = camera.center;
    return (
        Math.abs(normalizeRadians(camera.yaw - place.yaw)) < 1e-6 &&
        Math.abs(camera.pitch - place.pitch) < 1e-6 &&
        Math.abs(camera.radius - place.radius) < tol &&
        Math.hypot(c.x - place.center.x, c.y - place.center.y, c.z - place.center.z) < tol
    );
}
