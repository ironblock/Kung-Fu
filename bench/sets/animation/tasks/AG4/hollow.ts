import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Shows the first frame at once, but the clip does not play on.
export function playAgain(group: AnimationGroup): void {
    goToFrame(group, 0);
}
