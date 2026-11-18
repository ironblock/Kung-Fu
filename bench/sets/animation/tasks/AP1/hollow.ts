import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Fades from wherever the panel's alpha is now, not from 0.
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const clip = createPropertyAnimationClip("fade-in", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: panel.alpha },
                { time: durationMs / 1000, value: 1 },
            ],
        },
    ]);
    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
