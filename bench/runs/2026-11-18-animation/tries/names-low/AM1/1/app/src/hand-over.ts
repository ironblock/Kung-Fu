import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask, removeAnimationTask } from "@babylonjs/lite";

const activeHandOvers = new WeakMap<AnimationManager, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    const existing = activeHandOvers.get(manager);
    if (existing) {
        removeAnimationTask(manager, existing);
    }

    from.weight = 1;
    to.weight = 0;

    if (durationMs <= 0) {
        from.weight = 0;
        to.weight = 1;
        return;
    }

    let elapsed = 0;
    let task: AnimationTask;

    task = createAnimationTask((mgr, deltaMs) => {
        elapsed += deltaMs;
        const progress = Math.min(elapsed / durationMs, 1);
        to.weight = progress;
        from.weight = 1 - progress;
        if (progress >= 1) {
            removeAnimationTask(mgr, task);
            activeHandOvers.delete(mgr);
        }
    });

    addAnimationTask(manager, task);
    activeHandOvers.set(manager, task);
}
