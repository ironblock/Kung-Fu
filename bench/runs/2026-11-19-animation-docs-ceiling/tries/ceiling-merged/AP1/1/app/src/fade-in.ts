import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
} from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Shortest fade we allow. A clip whose keys all sit at time 0 makes
// createPropertyAnimationGroup throw, so zero, negative or non-finite
// durations are raised to this and finish on the first update.
const MIN_DURATION_MS = 1;

export function fadeIn(
    manager: AnimationManager,
    panel: { alpha: number },
    durationMs: number,
): AnimationGroup {
    const ms = Number.isFinite(durationMs) ? Math.max(durationMs, MIN_DURATION_MS) : MIN_DURATION_MS;

    // Key times are in seconds. Linear interpolation (the default) gives a steady rate,
    // and the first key makes the fade start from 0 whatever alpha was before.
    const clip = createPropertyAnimationClip("fade-in", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: ms / 1000, value: 1 },
            ],
        },
    ]);

    // The group attaches to the manager and starts playing; loop: false makes it write
    // the end value (1), then stop with isPlaying false.
    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
