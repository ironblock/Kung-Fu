import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** One update with the time to skip. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    updateAnimationManager(manager, ms);
}
