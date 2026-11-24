import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

// One mask object for the model, made by the factory once and filled from the saved settings.
const live = createAnimationGroupMask();

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    live.mode = saved.mode;
    live.names = [...saved.names];
    live.disabled = saved.disabled;
    group.mask = live;
}
