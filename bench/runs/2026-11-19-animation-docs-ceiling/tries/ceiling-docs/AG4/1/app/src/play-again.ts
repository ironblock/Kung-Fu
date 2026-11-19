import type { AnimationGroup } from "@babylonjs/lite";
import { addAnimationGroup, getAnimationGroupOwner, getAnimationGroups, playAnimation, stopAnimation } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    // Remember things a stop might disturb.
    const owner = getAnimationGroupOwner(group);
    const speedRatio = group.speedRatio;
    const loopAnimation = group.loopAnimation;
    const weight = group.weight;

    // Reset the finished clip to a clean stopped state.
    stopAnimation(group);

    // Restore settings; the clip keeps its own speed and stays a one-shot.
    group.speedRatio = speedRatio;
    group.loopAnimation = loopAnimation;
    group.weight = weight;

    // Rewind to the first frame of the clip's play range (a property clip
    // built with fromFrame/fromTime starts at _startTime, not at 0).
    group.currentTime = group._startTime ?? 0;

    // If a manager-driven group dropped out of its manager, put it back
    // so it keeps getting ticked.
    if (owner && !getAnimationGroups(owner).includes(group)) {
        addAnimationGroup(owner, group);
    }

    playAnimation(group);
}
