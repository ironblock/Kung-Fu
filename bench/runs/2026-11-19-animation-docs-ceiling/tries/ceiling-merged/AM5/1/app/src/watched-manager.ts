import {
    addAnimationTask,
    createAnimationManager,
    createAnimationTask,
    type AnimationManager,
} from "@babylonjs/lite";

/**
 * Creates an animation manager that calls `onStep` once per update, with the
 * step (in ms) that update applied.
 *
 * The reporting is done by an ordinary task added first, so it runs on every
 * update. It does not use the manager's single category-handler or pre-update
 * slots, which blending could replace later. The task receives the effective
 * delta (fixedDeltaMs, if set), and updates the library skips (negative or
 * non-finite delta) report nothing.
 */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    const watcher = createAnimationTask((_manager, deltaMs) => {
        onStep(deltaMs);
    });
    addAnimationTask(manager, watcher);
    return manager;
}
