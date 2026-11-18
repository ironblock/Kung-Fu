import { setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Setting the weight is what the slider needs. */
export function setShareNow(_manager: AnimationManager, group: AnimationGroup, share: number): void {
    setAnimationWeight(group, share);
}
