import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void {
    // playAnimation resumes from currentTime, which sits at the end of a finished clip.
    // stopAnimation rewinds currentTime to the first frame.
    stopAnimation(group);
    playAnimation(group);
}
