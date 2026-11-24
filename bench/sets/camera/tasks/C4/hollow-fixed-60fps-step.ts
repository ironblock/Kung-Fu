import { expDampFactor, lerpAngleShortest, runFrameInterpolation } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library's damping and shortest-arc blend, one 60 fps frame's worth per rendered frame, a quarter turn per leg.
const T = expDampFactor(1 / 60, 0.1);
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const start = camera.alpha;
    const total = 2 * Math.PI * turns;
    const legs = Math.max(1, Math.ceil(total / (Math.PI / 2)));
    for (let i = 1; i <= legs; i++) {
        const goal = start + (total * i) / legs;
        await runFrameInterpolation(scene, () => {
            camera.alpha = lerpAngleShortest(camera.alpha, goal, T);
            if (Math.abs(goal - camera.alpha) < 1e-3) { camera.alpha = goal; return false; }
            return true;
        });
    }
}
