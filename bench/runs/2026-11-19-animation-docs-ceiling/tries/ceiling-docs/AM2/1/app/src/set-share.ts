import { fadeAnimationWeight, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Shortest hold, in ms. It only has to be positive so the fade never divides by zero.
const HOLD_MS = 1;

/**
 * Sets a group's share (blend weight) immediately and makes it stick over any
 * fade already running for that group.
 */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    const value = Number.isFinite(share) ? Math.min(1, Math.max(0, share)) : 0;

    // Takes effect for the very next mixed frame.
    setAnimationWeight(group, value);

    // Supersede any fade in progress for this group with a flat fade (value -> value).
    // It ends within one frame and leaves the weight at `value`, so later fades work normally.
    fadeAnimationWeight(manager, group, { from: value, to: value, durationMs: HOLD_MS });
}
