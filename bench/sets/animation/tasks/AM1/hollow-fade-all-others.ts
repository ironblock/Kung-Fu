import { fadeAnimationWeight, getAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Hand the manager over to `to`: every other group on it fades out, `to` fades in from silence. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    for (const group of getAnimationGroups(manager)) {
        if (group !== to) {
            fadeAnimationWeight(manager, group, { from: group === from ? 1 : group.weight, to: 0, durationMs });
        }
    }
    fadeAnimationWeight(manager, to, { from: 0, to: 1, durationMs });
}
