import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

// A flight always takes the shortest way to its target heading, so a target one full turn away
// does not move at all and a half turn goes westward. Four quarter turns, chained, make the spin.
export async function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const quarter = durationMs / 4;
    for (let i = 0; i < 4; i++) {
        await flyGeospatialCameraToAsync(camera, scene, { yaw: camera.yaw + Math.PI / 2, durationMs: quarter, ease: (g) => g });
    }
}
