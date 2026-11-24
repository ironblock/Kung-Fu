import { addAnimationTask, createAnimationManager, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** A plain task runs on every update with the step applied; frames that apply no time are not logged. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    addAnimationTask(
        manager,
        createAnimationTask((_manager, stepMs) => {
            if (stepMs > 0) {
                onStep(stepMs);
            }
        })
    );
    return manager;
}
