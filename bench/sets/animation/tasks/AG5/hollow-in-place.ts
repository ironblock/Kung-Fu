import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

// Keep one live mask per clip and update it in place (the mask docs say push/pop on names is picked up).
export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    const mask = group.mask ?? (group.mask = createAnimationGroupMask());
    mask.mode = saved.mode;
    mask.disabled = saved.disabled;
    mask.names.length = 0;
    mask.names.push(...saved.names);
}
