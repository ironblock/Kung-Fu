import {
    addAnimationTask,
    createAnimationTask,
    fadeAnimationWeight,
    removeAnimationTask,
} from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, AnimationTask } from "@babylonjs/lite";

// One not-yet-started hand-over per manager, so a reversal can cancel it.
const pending = new WeakMap<AnimationManager, AnimationTask>();

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    // A hand-over still waiting for its first frame is superseded.
    const old = pending.get(manager);
    if (old) {
        pending.delete(manager);
        removeAnimationTask(manager, old);
    }

    const duration = Number.isFinite(durationMs) ? Math.max(durationMs, 1e-3) : 1e-3;

    // Pin the weights now (from = 1, to = 0). Fading a group replaces any fade
    // already running on it, so an earlier hand-over cannot keep moving them.
    // from = 1 with to = 0 for `to`, and 1 for `from`, turns on weighted mixing
    // semantics: `from` alone on the next frame.
    fadeAnimationWeight(manager, from, { from: 1, to: 1, durationMs: 1 });
    fadeAnimationWeight(manager, to, { from: 0, to: 0, durationMs: 1 });

    // The next update shows `from` alone; time zero of the blend is that frame.
    // The real fades start from this task, so they first step on the update after.
    const task = createAnimationTask((m, _delta, self) => {
        if (pending.get(m) === self) {
            pending.delete(m);
        }
        removeAnimationTask(m, self);
        fadeAnimationWeight(m, from, { from: 1, to: 0, durationMs: duration });
        fadeAnimationWeight(m, to, { from: 0, to: 1, durationMs: duration });
    });
    pending.set(manager, task);
    addAnimationTask(manager, task);
}
