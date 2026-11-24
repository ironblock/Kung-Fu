import { fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Replace any fade with one that holds `share`, and mix once at no time so the new share shows now. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    fadeAnimationWeight(manager, group, { from: share, to: share, durationMs: 1 });
    updateAnimationManager(manager, 0);
}
