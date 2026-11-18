import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Steps in whole fixed steps, rounding the time to the nearest step. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    const step = manager.fixedDeltaMs > 0 ? manager.fixedDeltaMs : ms;
    const count = Math.max(1, Math.round(ms / step));
    for (let i = 0; i < count; i++) {
        updateAnimationManager(manager, step);
    }
}
