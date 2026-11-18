import { playAnimation, goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    goToFrame(group, 0);
    playAnimation(group);
}
