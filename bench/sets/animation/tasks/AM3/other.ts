import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Whole fixed steps first, then the rest as one step of its own length. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    const fixed = manager.fixedDeltaMs;
    if (!(fixed > 0)) {
        updateAnimationManager(manager, ms);
        return;
    }
    const whole = Math.floor(ms / fixed);
    for (let i = 0; i < whole; i++) {
        updateAnimationManager(manager, fixed);
    }
    const rest = ms - whole * fixed;
    if (rest > 0) {
        manager.fixedDeltaMs = rest;
        updateAnimationManager(manager, rest);
        manager.fixedDeltaMs = fixed;
    }
}
