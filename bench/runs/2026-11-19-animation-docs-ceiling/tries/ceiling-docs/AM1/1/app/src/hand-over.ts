import {
    addAnimationGroup,
    addAnimationTask,
    createAnimationTask,
    getAnimationGroupOwner,
    playAnimation,
    removeAnimationTask,
    setAnimationWeight,
} from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, AnimationTask } from "@babylonjs/lite";

interface HandOverState {
    readonly task: AnimationTask;
    readonly from: AnimationGroup;
    readonly to: AnimationGroup;
}

// At most one running hand-over per manager.
const running = new WeakMap<AnimationManager, HandOverState>();

function endTask(manager: AnimationManager, task: AnimationTask): void {
    task.active = false;
    removeAnimationTask(manager, task);
}

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    if (from === to) {
        return;
    }

    // An earlier hand-over still in progress: stop it and settle it on its target,
    // so its groups do not keep fighting over the weights. Groups in the new pair
    // are overwritten just below.
    const previous = running.get(manager);
    if (previous) {
        endTask(manager, previous.task);
        running.delete(manager);
        setAnimationWeight(previous.from, 0);
        setAnimationWeight(previous.to, 1);
    }

    // Both groups must be on this manager, and `to` must be playing.
    if (getAnimationGroupOwner(from) !== manager) {
        addAnimationGroup(manager, from);
    }
    if (getAnimationGroupOwner(to) !== manager) {
        addAnimationGroup(manager, to);
    }
    if (!to.isPlaying) {
        playAnimation(to);
    }

    // Next frame shows `from` alone.
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);

    const total = Math.max(0, durationMs);
    let elapsed = 0;
    let first = true;

    const task = createAnimationTask((_m, deltaMs, self) => {
        if (first) {
            // The frame that follows the call must show `from` alone, so this tick adds no time.
            first = false;
            return;
        }
        elapsed += deltaMs;
        if (elapsed >= total) {
            setAnimationWeight(from, 0);
            setAnimationWeight(to, 1);
            endTask(manager, self);
            if (running.get(manager)?.task === self) {
                running.delete(manager);
            }
            return;
        }
        const share = elapsed / total;
        setAnimationWeight(to, share);
        setAnimationWeight(from, 1 - share);
    });

    running.set(manager, { task, from, to });
    addAnimationTask(manager, task);
}
