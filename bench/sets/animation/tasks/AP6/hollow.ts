import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Starts at the first key, but plays the keyed part only once.
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const clip = createPropertyAnimationClip("timeline-track", [{ path, frameRate, keys: keys.map((key) => ({ frame: key.frame, value: key.value })) }]);
    return createPropertyAnimationGroup(manager, target, clip, {
        loop: false,
        fromFrame: keys[0]!.frame,
        toFrame: keys[keys.length - 1]!.frame,
    });
}
