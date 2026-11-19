import { addAnimationTask, createAnimationManager, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Creates an animation manager that reports every update through `onStep`.
 *
 * The report comes from an ordinary, category-less animation task registered on
 * the manager. The manager hands each task the step it actually applied (the
 * fixed step if `fixedDeltaMs` is set, otherwise the caller's delta). The task
 * therefore runs exactly once per `updateAnimationManager` call.
 *
 * This deliberately avoids the manager's `_preUpdate` and `_taskCategoryHandler`
 * hooks and the `onUpdate` option: blending and weight fades may install or
 * replace those hooks later, and `onUpdate` is documented as firing only after
 * autonomous ticks. Weighted mixers skip only the "animation-group" category,
 * so this task keeps running when they are enabled.
 */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    const task = createAnimationTask((_manager, deltaMs) => {
        onStep(deltaMs);
    });
    addAnimationTask(manager, task);
    return manager;
}
