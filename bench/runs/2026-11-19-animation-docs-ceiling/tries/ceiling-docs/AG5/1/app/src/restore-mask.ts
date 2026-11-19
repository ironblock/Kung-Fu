import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

/**
 * Applies a saved (JSON-restored) mask to a glTF animation group.
 *
 * The saved value is a plain object, so it is never assigned directly:
 * the library only activates its controller's masking path when
 * `createAnimationGroupMask` is called, so the mask is always built through
 * it. Names are copied so the group never shares an array with the saved
 * settings or with another group.
 */
export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    const mask = createAnimationGroupMask(saved.names.slice(), saved.mode);
    mask.disabled = saved.disabled === true;
    group.mask = mask;
}
