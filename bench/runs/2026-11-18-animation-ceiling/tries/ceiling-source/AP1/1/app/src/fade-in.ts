import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Smallest fade we allow, in ms. The library rejects zero-length ranges, so a
// zero or negative duration becomes an (effectively instant) fade of this length.
const MIN_DURATION_MS = 0.001;

/**
 * Fade `panel.alpha` from 0 to 1 at a steady rate over `durationMs`, driven by `manager`.
 * Whatever alpha was before, it starts from 0 and stays at 1 once finished.
 * Returns the group playing the fade; its `isPlaying` becomes false when the fade is over.
 */
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    if (Number.isNaN(durationMs) || durationMs === Infinity || durationMs === -Infinity) {
        throw new RangeError(`fadeIn durationMs must be a finite number, got ${durationMs}`);
    }
    const seconds = Math.max(durationMs, MIN_DURATION_MS) / 1000;

    // Start from 0 right away rather than waiting for the first manager update.
    panel.alpha = 0;

    const clip = createPropertyAnimationClip("fadeIn", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: seconds, value: 1 },
            ],
            interpolation: "linear",
        },
    ]);

    // loop: false -> plays once, writes exactly 1 on the final tick, then isPlaying = false.
    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
