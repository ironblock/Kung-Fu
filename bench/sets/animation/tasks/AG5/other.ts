import { AnimationGroupMaskMode, createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    if (saved.disabled) {
        group.mask = undefined; // a disabled mask lets every node through
        return;
    }
    const mode = saved.mode === AnimationGroupMaskMode.Exclude ? AnimationGroupMaskMode.Exclude : AnimationGroupMaskMode.Include;
    group.mask = createAnimationGroupMask([...saved.names], mode);
}
