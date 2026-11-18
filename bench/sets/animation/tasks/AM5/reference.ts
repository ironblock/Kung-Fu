import { addAnimationTask, createAnimationManager, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** `onUpdate` fires only for the manager's own requestAnimationFrame loop, not for manual
 *  updates, so report from a plain task, which every update runs with the applied step. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    addAnimationTask(
        manager,
        createAnimationTask((_manager, stepMs) => onStep(stepMs))
    );
    return manager;
}
