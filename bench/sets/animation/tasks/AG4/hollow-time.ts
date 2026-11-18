import type { AnimationGroup } from "@babylonjs/lite";

// Rewinds the time only: right for a glTF clip that still counts as playing,
// but a finished property clip has stopped itself and stays at its end.
export function playAgain(group: AnimationGroup): void {
    group.currentTime = 0;
    group.isPlaying = true;
}
