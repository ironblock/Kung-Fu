import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    panel.alpha = 0;

    const durationSec = durationMs / 1000;

    const clip = createPropertyAnimationClip("fadeIn", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: durationSec, value: 1 },
            ],
            interpolation: "linear",
        },
    ]);

    const group = createPropertyAnimationGroup(manager, panel, clip, {
        loop: false,
    });

    return group;
}
