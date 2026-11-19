import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    const prev = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    updateAnimationManager(manager, ms);
    manager.fixedDeltaMs = prev;
}
