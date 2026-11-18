import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

// Treats every saved mask as an include list.
export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    const mask = createAnimationGroupMask(saved.names);
    mask.disabled = saved.disabled;
    group.mask = mask;
}
