import type { AnimationGroup } from "@babylonjs/lite";
import { playAnimation, stopAnimation } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    stopAnimation(group);
    playAnimation(group);
}
