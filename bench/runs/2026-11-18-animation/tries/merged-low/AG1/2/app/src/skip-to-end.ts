import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    group.loopAnimation = false;
    group.currentTime = group.duration;
    pauseAnimation(group);
}
