import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Moves the keys so the first one sits at time 0, in seconds.
export function loopKeyedTrack(
    manager: AnimationManager,
    target: object,
    path: string,
    keys: readonly { frame: number; value: number }[],
    frameRate: number
): AnimationGroup {
    const first = keys[0]!.frame;
    const clip = createPropertyAnimationClip("designer-track", [
        {
            path,
            keys: keys.map((key) => ({ time: (key.frame - first) / frameRate, value: key.value })),
        },
    ]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    group.loopAnimation = true;
    return group;
}
