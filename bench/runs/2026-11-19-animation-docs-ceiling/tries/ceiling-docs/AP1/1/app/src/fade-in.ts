import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/**
 * Fades `panel.alpha` from 0 to 1 at a steady (linear) rate over `durationMs`.
 * The returned group plays once (no loop); when it finishes, alpha is exactly 1
 * and `group.isPlaying` becomes false. The group is not touched again afterwards,
 * so later assignments to `panel.alpha` stick.
 */
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    // Keyframe times are in seconds. Keys must be strictly increasing, so guard
    // against zero/negative/NaN durations with a 1 ms floor.
    const durationSeconds = Math.max(Number.isFinite(durationMs) ? durationMs : 0, 1) / 1000;

    const clip = createPropertyAnimationClip("fadeIn", [
        {
            path: "alpha",
            interpolation: "linear",
            keys: [
                { time: 0, value: 0 },
                { time: durationSeconds, value: 1 },
            ],
        },
    ]);

    // Don't leave the old alpha visible until the first manager update.
    panel.alpha = 0;

    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
