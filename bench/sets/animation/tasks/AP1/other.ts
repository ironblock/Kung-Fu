import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

const FRAMES_PER_SECOND = 100;

// Keys in frames, and the group told not to loop after it is made.
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const lastFrame = (durationMs / 1000) * FRAMES_PER_SECOND;
    const clip = createPropertyAnimationClip(
        "panel-fade",
        [
            {
                path: "alpha",
                keys: [
                    { frame: 0, value: 0 },
                    { frame: lastFrame, value: 1 },
                ],
            },
        ],
        { frameRate: FRAMES_PER_SECOND }
    );
    const group = createPropertyAnimationGroup(manager, panel, clip, { fromFrame: 0, toFrame: lastFrame });
    group.loopAnimation = false;
    return group;
}
