import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    const mask = createAnimationGroupMask(saved.names, saved.mode);
    mask.disabled = saved.disabled;
    group.mask = mask;
}
