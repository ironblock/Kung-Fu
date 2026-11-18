import { goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    goToFrame(group, 0); // seek to the first frame (this pauses)
    playAnimation(group);
}
