import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    const UP = 0.2;
    const DOWN = 0.2;
    const TOTAL = UP + DOWN;
    let elapsed = -1;

    const task = createAnimationTask((_mgr, deltaMs) => {
        if (elapsed < 0) return;
        elapsed += deltaMs / 1000;
        if (elapsed >= TOTAL) {
            button.scale = 1;
            elapsed = -1;
        } else if (elapsed < UP) {
            button.scale = 1 + 0.5 * (elapsed / UP);
        } else {
            button.scale = 1.5 - 0.5 * ((elapsed - UP) / DOWN);
        }
    });

    addAnimationTask(manager, task);

    return () => {
        elapsed = 0;
    };
}
