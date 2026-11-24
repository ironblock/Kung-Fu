import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    try {
        await flyGeospatialCameraToAsync(camera, scene, { ...place, durationMs });
        return true;
    } catch {
        // An interrupted flight rejects its promise.
        return false;
    }
}
