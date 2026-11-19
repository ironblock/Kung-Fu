import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";
import { fadeAnimationWeight } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    group.weight = share;
    fadeAnimationWeight(manager, group, { to: share, durationMs: 1, from: share });
}
