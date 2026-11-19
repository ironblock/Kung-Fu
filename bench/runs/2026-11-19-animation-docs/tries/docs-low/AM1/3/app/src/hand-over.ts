import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask, removeAnimationTask, setAnimationWeight } from "@babylonjs/lite";

const activeTasks = new WeakMap<AnimationGroup, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    // Cancel any existing handover involving either group
    const existing = activeTasks.get(from) ?? activeTasks.get(to);
    if (existing) {
        removeAnimationTask(manager, existing);
        activeTasks.delete(from);
        activeTasks.delete(to);
    }

    // Set initial weights: from is fully active, to is fully inactive
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);

    if (durationMs <= 0) {
        setAnimationWeight(from, 0);
        setAnimationWeight(to, 1);
        return;
    }

    let elapsed = 0;

    const task = createAnimationTask((mgr, deltaMs) => {
        elapsed += deltaMs;
        const t = Math.min(elapsed / durationMs, 1);
        setAnimationWeight(to, t);
        setAnimationWeight(from, 1 - t);
        if (t >= 1) {
            removeAnimationTask(mgr, task);
            activeTasks.delete(from);
            activeTasks.delete(to);
        }
    });

    addAnimationTask(manager, task);
    activeTasks.set(from, task);
    activeTasks.set(to, task);
}
