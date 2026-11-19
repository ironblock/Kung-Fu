import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const track = {
        path,
        keys: keys.map((k) => ({ frame: k.frame, value: k.value })),
        frameRate,
        interpolation: "linear" as const,
    };

    const clip = createPropertyAnimationClip("loopKeyedTrack", [track], { frameRate });

    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: keys[0].frame,
        toFrame: keys[keys.length - 1].frame,
    });
}
