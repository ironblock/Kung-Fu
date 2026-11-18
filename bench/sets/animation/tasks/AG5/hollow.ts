import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

// Builds the mask the library's way, but drops the saved `disabled` flag.
export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    group.mask = createAnimationGroupMask(saved.names, saved.mode);
}
