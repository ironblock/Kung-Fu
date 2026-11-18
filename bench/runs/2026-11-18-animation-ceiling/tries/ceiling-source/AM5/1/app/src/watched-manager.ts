import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Creates an ordinary AnimationManager that calls `onStep` once per
 * `updateAnimationManager` call, with the step that update applied.
 *
 * The manager's `_preUpdate` hook does the reporting. `updateAnimationManager`
 * calls it once per accepted update, after resolving `fixedDeltaMs` against the
 * frame delta, so `stepMs` is the step actually applied to the animations.
 *
 * `fadeAnimationWeight` saves any existing `_preUpdate` and runs it first, so
 * weight fades keep this hook working. Enabling blending only sets the category
 * handler and does not touch `_preUpdate`. The hook closes over this call's
 * `onStep`, so each manager reports only its own updates.
 */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    manager._preUpdate = (_manager, stepMs) => {
        onStep(stepMs);
    };
    return manager;
}
