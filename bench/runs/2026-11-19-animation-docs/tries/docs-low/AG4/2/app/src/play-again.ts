import type { AnimationGroup } from "@babylonjs/lite";
import { stopAnimation, playAnimation } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    stopAnimation(group);
    playAnimation(group);
}
