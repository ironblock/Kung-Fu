import type { AnimationGroup } from "@babylonjs/lite";
import { playAnimation } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    group.currentTime = 0;
    group.loopAnimation = false;
    playAnimation(group);
}
