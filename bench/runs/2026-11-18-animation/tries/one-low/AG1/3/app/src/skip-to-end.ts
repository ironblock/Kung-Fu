import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    pauseAnimation(group);
    group.currentTime = group.duration;
}
