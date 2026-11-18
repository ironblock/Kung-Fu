import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** A manager with a fixed step uses that step in place of the delta it is given, so lift the
 *  fixed step for one update and put it back. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    const fixed = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    try {
        updateAnimationManager(manager, ms);
    } finally {
        manager.fixedDeltaMs = fixed;
    }
}
