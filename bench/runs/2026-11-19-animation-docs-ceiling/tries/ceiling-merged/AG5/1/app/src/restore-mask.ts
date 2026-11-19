import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void {
    // Always assign a fresh mask object with a fresh names array. The group does not
    // notice in-place edits to names at the same length, and the saved object may be
    // shared with settings or with another clip, so it must not be aliased.
    group.mask = {
        mode: saved.mode,
        names: Array.from(saved.names ?? []),
        disabled: !!saved.disabled,
    };
}
