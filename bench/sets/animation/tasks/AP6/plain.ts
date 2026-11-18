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
    // The clip's range is its keys, so the default play range is what we want.
    return createPropertyAnimationGroup(manager, target, clip, { loop: true });
}
