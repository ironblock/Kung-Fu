import type { AnimationGroup } from "@babylonjs/lite";
import { goToFrame } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    const frameRate = group.frameRate ?? 30;
    const lastFrame = Math.floor(group.duration * frameRate);

    goToFrame(group, lastFrame);
    group.currentTime = group.duration;
    group.isPlaying = false;
    group._stopped = true;
}
