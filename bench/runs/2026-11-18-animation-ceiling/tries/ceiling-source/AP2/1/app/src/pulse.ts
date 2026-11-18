import { addAnimationTask, createAnimationTask, removeAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

const HALF_MS = 200;
const TOTAL_MS = 400;
const PEAK = 1.5;

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    let elapsedMs = 0;

    const task = createAnimationTask(
        (_manager, deltaMs, self) => {
            elapsedMs += deltaMs;
            if (elapsedMs >= TOTAL_MS) {
                // removeAnimationTask runs the dispose hook, which rests the scale at 1.
                removeAnimationTask(manager, self);
                return;
            }
            button.scale = elapsedMs <= HALF_MS ? 1 + ((PEAK - 1) * elapsedMs) / HALF_MS : PEAK - ((PEAK - 1) * (elapsedMs - HALF_MS)) / HALF_MS;
        },
        {
            dispose: () => {
                elapsedMs = 0;
                button.scale = 1;
            },
        }
    );

    return () => {
        elapsedMs = 0;
        button.scale = 1;
        // No-op if the task is already attached (press during a pulse); re-attaches after a finished pulse.
        addAnimationTask(manager, task);
    };
}
