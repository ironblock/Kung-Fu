import { runFrameInterpolation } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Ease alpha toward each goal by a tenth of the rest every frame, a quarter turn at a time.
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const start = camera.alpha;
    const total = 2 * Math.PI * turns;
    const legs = Math.max(1, Math.ceil(Math.abs(total) / (Math.PI / 2)));
    for (let i = 1; i <= legs; i++) {
        const goal = start + (total * i) / legs;
        await runFrameInterpolation(scene, () => {
            camera.alpha += (goal - camera.alpha) * 0.1;
            if (Math.abs(goal - camera.alpha) < 1e-3) {
                camera.alpha = goal;
                return false;
            }
            return true;
        });
    }
}
