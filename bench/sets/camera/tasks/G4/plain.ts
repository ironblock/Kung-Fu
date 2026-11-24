import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    return flyGeospatialCameraToAsync(camera, scene, { yaw: camera.yaw + 2 * Math.PI, durationMs });
}
