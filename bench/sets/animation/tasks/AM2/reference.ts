import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** A running fade keeps writing the weight each frame, and setting the weight does not stop it.
 *  A new fade on the same group replaces the old one, so start one that holds `share`. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    fadeAnimationWeight(manager, group, { from: share, to: share, durationMs: 1 });
}
