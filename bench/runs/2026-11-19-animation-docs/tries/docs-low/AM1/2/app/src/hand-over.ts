import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import { setAnimationWeight, createAnimationTask, addAnimationTask, removeAnimationTask } from "@babylonjs/lite";

const activeTasks = new WeakMap<AnimationManager, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    const existing = activeTasks.get(manager);
    if (existing) {
        removeAnimationTask(manager, existing);
        activeTasks.delete(manager);
    }

    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);

    if (durationMs <= 0) {
        setAnimationWeight(from, 0);
        setAnimationWeight(to, 1);
        return;
    }

    let elapsed = 0;
    let finished = false;

    const task: AnimationTask = createAnimationTask((mgr, deltaMs) => {
        if (finished) return;
        elapsed += deltaMs;
        const t = Math.min(elapsed / durationMs, 1);
        setAnimationWeight(from, 1 - t);
        setAnimationWeight(to, t);
        if (t >= 1) {
            finished = true;
            removeAnimationTask(mgr, task);
            if (activeTasks.get(mgr) === task) {
                activeTasks.delete(mgr);
            }
        }
    });

    addAnimationTask(manager, task);
    activeTasks.set(manager, task);
}
