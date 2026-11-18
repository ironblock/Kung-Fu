import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask, removeAnimationTask } from "@babylonjs/lite";

const activeTasks = new WeakMap<AnimationManager, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    if (from === to) return;

    const existing = activeTasks.get(manager);
    if (existing) {
        removeAnimationTask(manager, existing);
        activeTasks.delete(manager);
    }

    from.weight = 1;
    to.weight = 0;

    if (durationMs <= 0) {
        from.weight = 0;
        to.weight = 1;
        return;
    }

    let elapsed = 0;

    const task = createAnimationTask((mgr, deltaMs, task) => {
        elapsed += deltaMs;
        const t = Math.min(elapsed / durationMs, 1);
        from.weight = 1 - t;
        to.weight = t;
        if (t >= 1) {
            removeAnimationTask(mgr, task);
            activeTasks.delete(mgr);
        }
    });

    activeTasks.set(manager, task);
    addAnimationTask(manager, task);
}
