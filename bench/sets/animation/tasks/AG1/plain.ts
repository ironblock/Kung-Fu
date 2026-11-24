import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void {
    const lastFrame = group.duration * (group.frameRate ?? 60);
    goToFrame(group, lastFrame);
}
