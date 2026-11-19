import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

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

    const clip = createPropertyAnimationClip("looped-track", [track]);

    const fromTime = keys[0].frame / frameRate;
    const toTime = keys[keys.length - 1].frame / frameRate;

    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromTime,
        toTime,
    });
}
