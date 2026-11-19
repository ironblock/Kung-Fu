import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Advance everything on `manager` (clips, tasks, weight fades) by exactly `ms`
 * milliseconds in a single update, as if that much time had passed at once.
 *
 * A manager with a non-zero `fixedDeltaMs` may substitute its fixed step for the
 * delta passed to `updateAnimationManager`. To get the exact amount, the fixed
 * step is switched off for this one call and then restored, so later frames
 * behave as before.
 */
export function skipAhead(manager: AnimationManager, ms: number): void {
    if (!Number.isFinite(ms)) {
        throw new RangeError("skipAhead: ms must be a finite number");
    }
    if (ms <= 0) {
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
