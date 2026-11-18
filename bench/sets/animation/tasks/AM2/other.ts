import { fadeAnimationWeight, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Set the weight, then replace any fade with one that ends at once where it starts. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    setAnimationWeight(group, share);
    fadeAnimationWeight(manager, group, { to: share, durationMs: Number.MIN_VALUE });
}
