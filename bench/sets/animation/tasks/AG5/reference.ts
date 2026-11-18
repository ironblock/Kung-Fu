import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    // Masking only takes effect once the library's factory has run; a plain object of the
    // same shape is ignored by the clip until then. Rebuild the mask through the factory.
    const mask = createAnimationGroupMask(saved.names, saved.mode);
    mask.disabled = saved.disabled;
    group.mask = mask;
}
