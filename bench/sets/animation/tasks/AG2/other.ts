import { goToFrame, playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const rate = group.frameRate || 60;
    const frame = group.currentTime * rate;
    stopAnimation(group);
    return function resume(): void {
        playAnimation(group); // clears the stop so the seek below can apply
        goToFrame(group, frame); // seeks and pauses
        playAnimation(group);
    };
}
