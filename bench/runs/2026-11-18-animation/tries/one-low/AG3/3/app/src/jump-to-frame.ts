import type { AnimationGroup } from "@babylonjs/lite";
import { goToFrame, playAnimation } from "@babylonjs/lite";

export function jumpToFrame(group: AnimationGroup, frame: number): void {
    goToFrame(group, frame);
    playAnimation(group);
}
