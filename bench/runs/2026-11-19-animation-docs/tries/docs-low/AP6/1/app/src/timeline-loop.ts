import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
} from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const clip = createPropertyAnimationClip(
        path,
        [
            {
                path,
                keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
                frameRate,
                interpolation: "linear",
            },
        ],
        { frameRate }
    );

    const firstFrame = keys[0].frame;
    const lastFrame = keys[keys.length - 1].frame;

    return createPropertyAnimationGroup(manager, target, clip, {
        fromFrame: firstFrame,
        toFrame: lastFrame,
        loop: true,
    });
}
