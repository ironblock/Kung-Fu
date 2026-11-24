import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/**
 * Plays a keyed track on `manager`, looping forever between its first and last key.
 *
 * The play range is set explicitly to [first key, last key]. The library's default range
 * is [0, last key], which would replay the empty stretch before the first key on every
 * loop instead of jumping straight from the last key back to the first.
 */
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    if (keys.length < 2) {
        throw new Error("loopKeyedTrack requires at least two keys");
    }
    const firstFrame = keys[0]!.frame;
    const lastFrame = keys[keys.length - 1]!.frame;

    const clip = createPropertyAnimationClip(
        `loop:${path}`,
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

    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: firstFrame,
        toFrame: lastFrame,
    });
}
