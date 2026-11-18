import { stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    group.currentTime = group.duration;
    stopAnimation(group);
}
