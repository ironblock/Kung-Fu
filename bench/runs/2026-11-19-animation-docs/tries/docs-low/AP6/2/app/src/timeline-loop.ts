import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation } from "@babylonjs/lite";

export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const clip = createPropertyAnimationClip("loopKeyedTrack", [
        {
            path,
            frameRate,
            interpolation: "linear",
            keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
        },
    ]);

    const group = createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: keys[0].frame,
        toFrame: keys[keys.length - 1].frame,
    });

    playAnimation(group);

    return group;
}
