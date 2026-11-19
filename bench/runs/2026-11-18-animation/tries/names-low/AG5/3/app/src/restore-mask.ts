import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    group.mask = saved;
}
