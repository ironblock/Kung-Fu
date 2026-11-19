import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Moves everything on the manager (clips, tasks, weight fades) forward by
 * exactly `ms` milliseconds in a single update.
 *
 * A manager with fixedDeltaMs > 0 ignores the delta passed to
 * updateAnimationManager, so the fixed step is switched off for this one call
 * and restored afterwards, even if an update throws.
 */
export function skipAhead(manager: AnimationManager, ms: number): void {
    const savedFixedDeltaMs = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    try {
        updateAnimationManager(manager, ms);
    } finally {
        manager.fixedDeltaMs = savedFixedDeltaMs;
    }
}
