import { playAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Rewind only a clip that has reached its end; a clip stopped part way just resumes.
export function playAgain(group: AnimationGroup): void {
    if (group.currentTime >= group.duration) {
        group.currentTime = 0;
    }
    playAnimation(group);
}
