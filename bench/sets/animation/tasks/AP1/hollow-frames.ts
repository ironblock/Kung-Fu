import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Keys in frames at 30 per second, but the frame rate is never given to the clip.
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const clip = createPropertyAnimationClip("fade-in", [
        {
            path: "alpha",
            keys: [
                { frame: 0, value: 0 },
                { frame: (durationMs / 1000) * 30, value: 1 },
            ],
        },
    ]);
    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
