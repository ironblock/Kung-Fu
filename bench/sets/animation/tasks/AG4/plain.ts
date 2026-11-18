import { playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    playAnimation(group);
}
