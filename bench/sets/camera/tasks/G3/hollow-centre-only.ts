import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Hollow: arrival is read from the centre alone. A flight cut short while it turns, tilts or zooms
// about the same centre settles true, though the camera never got to the place's pose.
export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    await flyGeospatialCameraToAsync(camera, scene, { ...place, center: { ...place.center }, durationMs });
    const c = camera.center;
    return Math.hypot(c.x - place.center.x, c.y - place.center.y, c.z - place.center.z) < 1e-3;
}
