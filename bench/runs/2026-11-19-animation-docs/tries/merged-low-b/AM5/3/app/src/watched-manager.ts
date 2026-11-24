import { createAnimationManager, createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    const task = createAnimationTask((_mgr, deltaMs) => {
        onStep(deltaMs);
    });
    addAnimationTask(manager, task);
    return manager;
}
