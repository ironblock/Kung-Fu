import type { AnimationGroup } from "@babylonjs/lite";
import { getAnimationGroupOwner, goToFrame, pauseAnimation } from "@babylonjs/lite";

/**
 * Jump a playing clip to its final pose and hold it there, paused.
 */
export function skipToEnd(group: AnimationGroup): void {
    const engine = getAnimationGroupOwner(group)?.engine;
    const frameRate = group.frameRate ?? 60; // glTF clips default to 60fps

    // Seek one second past the end. Samplers clamp to their last key, and property clips clamp
    // the seek to their key domain, so this always evaluates the exact final keyframe values
    // without float rounding in duration * frameRate landing a hair before the last key.
    // goToFrame evaluates the pose and pauses the group.
    goToFrame(group, (group.duration + 1) * frameRate, engine);

    // Make sure it is paused (so looping cannot wrap it back) and that progress reads 100%.
    pauseAnimation(group);
    group.currentTime = group.duration;
}
