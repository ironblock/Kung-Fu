import type { AnimationManager } from "@babylonjs/lite";
import { updateAnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    if (ms <= 0) return;

    const fixed = manager.fixedDeltaMs;
    if (fixed > 0) {
        const fullSteps = Math.floor(ms / fixed);
        const remainder = ms - fullSteps * fixed;
        for (let i = 0; i < fullSteps; i++) {
            updateAnimationManager(manager, fixed);
        }
        if (remainder > 0) {
            updateAnimationManager(manager, remainder);
        }
    } else {
        updateAnimationManager(manager, ms);
    }
}
