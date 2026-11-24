import { onBeforeRender } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

// Drive the heading frame by frame; once done, the callback stays registered but does nothing.
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const yaw0 = camera.yaw;
    let elapsed = 0;
    let finished = false;
    return new Promise((resolve) => {
        onBeforeRender(scene, (dt) => {
            if (finished) {
                return;
            }
            elapsed += dt > 0 ? dt : 16;
            const g = Math.min(1, elapsed / durationMs);
            const e = g < 0.5 ? 2 * g * g : 1 - 2 * (1 - g) * (1 - g);
            camera.yaw = yaw0 + 2 * Math.PI * e;
            if (g >= 1) {
                finished = true;
                resolve();
            }
        });
    });
}
