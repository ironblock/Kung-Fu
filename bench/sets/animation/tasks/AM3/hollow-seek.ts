import { getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Moves each group's clock, then asks for a frame of no length to write the values. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    for (const group of getAnimationGroups(manager)) {
        group.currentTime += ms / 1000;
    }
    updateAnimationManager(manager, 0);
}
