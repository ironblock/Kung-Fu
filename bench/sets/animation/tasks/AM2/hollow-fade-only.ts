import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** A very short fade to `share`: right after one frame, but not at once. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    fadeAnimationWeight(manager, group, { to: share, durationMs: 1 });
}
