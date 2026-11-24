import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const keyframes = keys.map((k) => ({ frame: k.frame, value: k.value }));

    const track = {
        path,
        keys: keyframes,
        frameRate,
        interpolation: "linear" as const,
    };

    const clip = createPropertyAnimationClip(path, [track], { frameRate });

    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: keys[0].frame,
    });
}
