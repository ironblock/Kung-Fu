import type { AnimationManager } from "@babylonjs/lite";
import { updateAnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    if (manager.fixedDeltaMs > 0) {
        const steps = Math.floor(ms / manager.fixedDeltaMs);
        const remainder = ms - steps * manager.fixedDeltaMs;

        for (let i = 0; i < steps; i++) {
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
