import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Lifts the fixed step but never puts it back. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    manager.fixedDeltaMs = 0;
    updateAnimationManager(manager, ms);
}
