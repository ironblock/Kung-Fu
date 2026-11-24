import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    const frameRate = group.frameRate ?? 60;
    const lastFrame = group.duration * frameRate;

    goToFrame(group, lastFrame);
    group.currentTime = group.duration;
}
