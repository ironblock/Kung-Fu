import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const durationS = durationMs / 1000;
    const clip = createPropertyAnimationClip("fadeIn", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: durationS, value: 1 },
            ],
            interpolation: "linear",
        },
    ]);
    return createPropertyAnimationGroup(manager, panel, clip, {
        loop: false,
        fromTime: 0,
        toTime: durationS,
    });
}
