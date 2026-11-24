import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Shifts the keys to start at 0 but keeps the old last frame as the end of the range,
// so every loop holds the last value for a while.
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const first = keys[0]!.frame;
    const clip = createPropertyAnimationClip("timeline-track", [{ path, frameRate, keys: keys.map((key) => ({ frame: key.frame - first, value: key.value })) }]);
    return createPropertyAnimationGroup(manager, target, clip, { loop: true, toFrame: keys[keys.length - 1]!.frame });
}
