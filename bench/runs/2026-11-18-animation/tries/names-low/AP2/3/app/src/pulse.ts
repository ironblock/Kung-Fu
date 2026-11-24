import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        if (!task.active) return;
        elapsed += deltaMs;
        if (elapsed >= 400) {
            button.scale = 1;
            task.active = false;
            return;
        }
        if (elapsed < 200) {
            button.scale = 1 + 0.5 * (elapsed / 200);
        } else {
            button.scale = 1.5 - 0.5 * ((elapsed - 200) / 200);
        }
    });

    task.active = false;
    addAnimationTask(manager, task);

    return () => {
        elapsed = 0;
        task.active = true;
    };
}
