import {
    createAnimationManager,
    createAnimationTask,
    addAnimationTask,
    type AnimationManager,
} from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();

    const task = createAnimationTask((mgr, deltaMs) => {
        const step = mgr.fixedDeltaMs > 0 ? mgr.fixedDeltaMs : deltaMs;
        onStep(step);
    });

    addAnimationTask(manager, task);

    return manager;
}
