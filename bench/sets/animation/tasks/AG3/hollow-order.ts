import { goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// The Babylon.js order (start, then seek): the seek leaves the clip paused.
export function jumpToFrame(group: AnimationGroup, frame: number): void {
    playAnimation(group);
    goToFrame(group, frame);
}
