import { addAnimationTask, createAnimationTask, removeAnimationTask, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** A hand-made fade: a per-frame task that sets both weights from the elapsed time.
 *  It runs after the manager has mixed the frame, so the mix lags one frame behind. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);
    let elapsed = 0;
    const task = createAnimationTask((m, deltaMs) => {
        elapsed = Math.min(durationMs, elapsed + deltaMs);
        const t = elapsed / durationMs;
        setAnimationWeight(from, 1 - t);
        setAnimationWeight(to, t);
        if (elapsed >= durationMs) {
            removeAnimationTask(m, task);
        }
    });
    addAnimationTask(manager, task);
}
