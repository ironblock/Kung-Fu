import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Advance everything on `manager` (clips, tasks, weight fades) by exactly `ms`
 * milliseconds in a single update.
 *
 * `updateAnimationManager` replaces the delta with `fixedDeltaMs` whenever that is
 * positive, so for fixed-step managers the step is lifted for this one call and
 * restored afterwards (even if a task throws). Later frames see the same
 * `fixedDeltaMs` as before.
 */
export function skipAhead(manager: AnimationManager, ms: number): void {
    if (!Number.isFinite(ms) || ms <= 0) {
        return;
    }
    const savedFixedDeltaMs = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    try {
        updateAnimationManager(manager, ms);
    } finally {
        manager.fixedDeltaMs = savedFixedDeltaMs;
    }
}
