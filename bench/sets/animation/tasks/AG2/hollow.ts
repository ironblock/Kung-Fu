import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Freezes correctly, but resume restarts the clip from its first frame.
export function freezeForPosing(group: AnimationGroup): () => void {
    stopAnimation(group);
    return () => playAnimation(group);
}
