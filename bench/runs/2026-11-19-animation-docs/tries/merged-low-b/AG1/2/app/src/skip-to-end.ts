import type { AnimationGroup } from "@babylonjs/lite";
import { goToFrame } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    group.loopAnimation = false;
    const frameRate = group.frameRate ?? 60;
    goToFrame(group, group.duration * frameRate);
}
