import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    if (manager.fixedDeltaMs > 0) {
        const fullSteps = Math.floor(ms / manager.fixedDeltaMs);
        const remainder = ms - fullSteps * manager.fixedDeltaMs;

        for (let i = 0; i < fullSteps; i++) {
            updateAnimationManager(manager, manager.fixedDeltaMs);
        }

        if (remainder > 0) {
            const saved = manager.fixedDeltaMs;
            manager.fixedDeltaMs = 0;
            updateAnimationManager(manager, remainder);
            manager.fixedDeltaMs = saved;
        }
    } else {
        updateAnimationManager(manager, ms);
    }
}
