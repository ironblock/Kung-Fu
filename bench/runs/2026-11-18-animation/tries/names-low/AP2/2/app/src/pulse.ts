import { createAnimationTask, addAnimationTask, removeAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationTask } from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    let task: AnimationTask | null = null;
    let elapsed = 0;

    const update = (mgr: AnimationManager, deltaMs: number, t: AnimationTask): void => {
        elapsed += deltaMs;
        if (elapsed >= 400) {
            button.scale = 1;
            t.active = false;
            removeAnimationTask(mgr, t);
            task = null;
        } else if (elapsed < 200) {
            button.scale = 1 + 0.5 * (elapsed / 200);
        } else {
            button.scale = 1.5 - 0.5 * ((elapsed - 200) / 200);
        }
    };

    return (): void => {
        if (task !== null) {
            removeAnimationTask(manager, task);
        }
        elapsed = 0;
        task = createAnimationTask(update);
        addAnimationTask(manager, task);
    };
}
