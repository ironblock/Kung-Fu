import type { AnimationGroup } from "@babylonjs/lite";
import { goToFrame } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    const frameRate = group.frameRate ?? 60;
    const lastFrame = Math.round(group.duration * frameRate);
    goToFrame(group, lastFrame);
}
