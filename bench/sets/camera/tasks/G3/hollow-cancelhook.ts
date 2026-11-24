import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// The library resolves its flight promise both when it lands and when it is cut short. When it lands,
// it clears camera._cancelFly; when a newer flight takes over, that flight's own hook is installed.
export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    await flyGeospatialCameraToAsync(camera, scene, { ...place, center: { ...place.center }, durationMs });
    return camera._cancelFly === undefined;
}
