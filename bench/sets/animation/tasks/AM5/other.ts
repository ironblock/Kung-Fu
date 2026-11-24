import { addAnimationTask, createAnimationManager, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationTaskUpdate } from "@babylonjs/lite";

/** A named update function kept as a task on the manager. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const report: AnimationTaskUpdate = (_owner, deltaMs) => {
        onStep(deltaMs);
    };
    const manager = createAnimationManager({});
    const task = createAnimationTask(report, { category: "frame-log" });
    addAnimationTask(manager, task);
    return manager;
}
