import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

const FPS = 60;

// Keys on whole frames at 60 per second: the duration is rounded to the nearest frame.
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const lastFrame = Math.max(1, Math.round((durationMs / 1000) * FPS));
    const clip = createPropertyAnimationClip(
        "fade-in",
        [
            {
                path: "alpha",
                keys: [
                    { frame: 0, value: 0 },
                    { frame: lastFrame, value: 1 },
                ],
            },
        ],
        { frameRate: FPS }
    );
    return createPropertyAnimationGroup(manager, panel, clip, { loop: false });
}
