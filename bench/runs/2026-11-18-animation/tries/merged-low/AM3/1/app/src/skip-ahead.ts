import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    const saved = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    try {
        updateAnimationManager(manager, ms);
    } finally {
        manager.fixedDeltaMs = saved;
    }
}
