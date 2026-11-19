import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask, removeAnimationTask, setAnimationWeight } from "@babylonjs/lite";

const activeTasks = new WeakMap<AnimationGroup, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    // Cancel any in-flight hand-over that involves either group
    const prevFrom = activeTasks.get(from);
    if (prevFrom) {
        removeAnimationTask(manager, prevFrom);
        activeTasks.delete(from);
    }
    const prevTo = activeTasks.get(to);
    if (prevTo) {
        removeAnimationTask(manager, prevTo);
        activeTasks.delete(to);
    }

    // Capture current weights as the starting point so the transition is smooth
    const fromStart = from.weight;
    const toStart = to.weight;

    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs;
        const t = durationMs > 0 ? Math.min(elapsed / durationMs, 1) : 1;

        const toWeight = toStart + (1 - toStart) * t;
        setAnimationWeight(to, toWeight);
        setAnimationWeight(from, 1 - toWeight);

        if (t >= 1) {
            task.active = false;
            activeTasks.delete(from);
            activeTasks.delete(to);
        }
    });

    addAnimationTask(manager, task);
    activeTasks.set(from, task);
    activeTasks.set(to, task);
}
