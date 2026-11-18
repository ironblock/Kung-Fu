import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

// A disabled mask filters nothing, so there is nothing to build for it.
export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    if (saved.disabled) {
        return;
    }
    group.mask = createAnimationGroupMask(saved.names, saved.mode);
}
