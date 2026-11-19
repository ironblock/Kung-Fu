import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    const frameRate = group.frameRate ?? 60;
    const lastFrame = Math.ceil(group.duration * frameRate);
    goToFrame(group, lastFrame);
    group.currentTime = group.duration;
}
