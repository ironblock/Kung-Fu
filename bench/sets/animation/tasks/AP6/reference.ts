import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const clip = createPropertyAnimationClip("timeline-track", [{ path, frameRate, keys: keys.map((key) => ({ frame: key.frame, value: key.value })) }]);
    // A clip's timeline starts at 0, not at its first key: play the keyed part only.
    return createPropertyAnimationGroup(manager, target, clip, {
        loop: true,
        fromFrame: keys[0]!.frame,
        toFrame: keys[keys.length - 1]!.frame,
    });
}
