import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Any positive finite duration is accepted by the library's fade. This one is so short that
// the fade finishes on the first frame with a positive delta, and until then it only ever
// produces `share`, since from === to.
const HOLD_DURATION_MS = 1e-6;

/**
 * Set a group's blend share immediately, cancelling any fade in progress for that group.
 * Fades of other groups are untouched, and the group can be faded again afterwards.
 */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    // The fade list is private to the library, so the only supported way to drop this group's
    // pending fade is to schedule a replacement. This one starts and ends at `share`:
    // it writes group.weight = share right now and replaces any earlier fade for this group.
    // On the next manager update it computes `share` again and then removes itself.
    // It validates `share` to [0, 1] and throws otherwise.
    fadeAnimationWeight(manager, group, { from: share, to: share, durationMs: HOLD_DURATION_MS });
}
