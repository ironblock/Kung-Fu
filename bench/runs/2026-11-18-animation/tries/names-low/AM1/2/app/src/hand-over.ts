import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask, removeAnimationTask } from "@babylonjs/lite";

const activeTasks = new WeakMap<AnimationGroup, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    // Cancel any in-flight hand-over that involves either group.
    const existingFrom = activeTasks.get(from);
    if (existingFrom) {
        removeAnimationTask(manager, existingFrom);
        activeTasks.delete(from);
    }
    const existingTo = activeTasks.get(to);
    if (existingTo) {
        removeAnimationTask(manager, existingTo);
        activeTasks.delete(to);
    }

    const fromWeight = from.weight;
    const toWeight = to.weight;

    if (durationMs <= 0) {
        from.weight = 0;
        to.weight = 1;
        return;
    }

    let elapsed = 0;

    const task: AnimationTask = createAnimationTask((mgr, deltaMs) => {
        elapsed += deltaMs;
        const progress = Math.min(elapsed / durationMs, 1);

        to.weight = toWeight + (1 - toWeight) * progress;
        from.weight = fromWeight * (1 - progress);

        if (progress >= 1) {
            removeAnimationTask(mgr, task);
            activeTasks.delete(from);
            activeTasks.delete(to);
        }
    });

    activeTasks.set(from, task);
    activeTasks.set(to, task);
    addAnimationTask(manager, task);
}
