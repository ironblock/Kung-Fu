import {
    fadeAnimationWeight,
    setAnimationWeight,
    type AnimationGroup,
    type AnimationManager,
} from "@babylonjs/lite";

/**
 * Sets a group's share (weight) at once and cancels any fade in progress for it.
 *
 * The library has no way to cancel a fade, but a new fade on the same group
 * replaces the old one. So after setting the weight directly, we start a
 * fade from `share` to `share`. It holds the weight at `share` on every
 * later frame and cannot hold back a later fade, which replaces it as usual.
 * Fades of other groups are untouched.
 */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    // Throws if share is not finite or outside [0, 1]; the weight is applied right away.
    setAnimationWeight(group, share);

    // Replace any running fade on this group with a constant one.
    // durationMs is kept above 0 to avoid a possible 0/0 in the tween.
    fadeAnimationWeight(manager, group, { from: share, to: share, durationMs: 1 });
}
