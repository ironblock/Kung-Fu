import { goToFrame, playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Freeze on a whole frame: stopping leaves the nodes to us; resume seeks back to that frame and plays.
export function freezeForPosing(group: AnimationGroup): () => void {
    const frame = Math.round(group.currentTime * (group.frameRate || 60));
    stopAnimation(group);
    return () => {
        playAnimation(group);
        goToFrame(group, frame);
        playAnimation(group);
    };
}
