import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";
import {
    createAnimationTask,
    addAnimationTask,
    removeAnimationTask,
    setAnimationWeight,
    playAnimation,
} from "@babylonjs/lite";

const activeHandOvers = new WeakMap<AnimationManager, AnimationTask>();

export function handOver(
    manager: AnimationManager,
    from: AnimationGroup,
    to: AnimationGroup,
    durationMs: number,
): void {
    // Cancel any in-progress handover on this manager
    const existing = activeHandOvers.get(manager);
    if (existing) {
        removeAnimationTask(manager, existing);
        activeHandOvers.delete(manager);
    }

    // Ensure both groups are playing
    if (!from.isPlaying) playAnimation(from);
    if (!to.isPlaying) playAnimation(to);

    // Initial state: from at full weight, to at zero
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);

    // Zero or negative duration: snap to final state immediately
    if (durationMs <= 0) {
        setAnimationWeight(from, 0);
        setAnimationWeight(to, 1);
        return;
    }

    let elapsed = 0;
    let firstFrame = true;

    const task = createAnimationTask((mgr, deltaMs) => {
        if (firstFrame) {
            firstFrame = false;
            return;
        }
        elapsed += deltaMs;
        const progress = Math.min(elapsed / durationMs, 1);
        setAnimationWeight(from, 1 - progress);
        setAnimationWeight(to, progress);
        if (progress >= 1) {
            removeAnimationTask(mgr, task);
            activeHandOvers.delete(mgr);
        }
    });

    addAnimationTask(manager, task);
    activeHandOvers.set(manager, task);
}
