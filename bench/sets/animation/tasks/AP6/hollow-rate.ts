import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Plays the keyed part in a loop, but never tells the clip the timeline's frame rate.
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    _frameRate: number
): AnimationGroup {
    const clip = createPropertyAnimationClip("timeline-track", [{ path, keys: keys.map((key) => ({ frame: key.frame, value: key.value })) }]);
    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: keys[0]!.frame,
        toFrame: keys[keys.length - 1]!.frame,
    });
}
