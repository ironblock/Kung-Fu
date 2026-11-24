import { pauseAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    // Without looping, the next frame clamps the time to the end and applies it.
    group.loopAnimation = false;
    pauseAnimation(group);
    group.currentTime = group.duration;
}
