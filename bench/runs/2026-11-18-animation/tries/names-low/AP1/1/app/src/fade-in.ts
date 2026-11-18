import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    playAnimation,
} from "@babylonjs/lite";

import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function fadeIn(
    manager: AnimationManager,
    panel: { alpha: number },
    durationMs: number
): AnimationGroup {
    const clip = createPropertyAnimationClip("fadeIn", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: durationMs / 1000, value: 1 },
            ],
            interpolation: "linear",
        },
    ]);

    const group = createPropertyAnimationGroup(manager, panel, clip);
    playAnimation(group);
    return group;
}
