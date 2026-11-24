import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { setAnimationWeight, fadeAnimationWeight } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    setAnimationWeight(group, share);
    fadeAnimationWeight(manager, group, { to: share, durationMs: 1 });
}
