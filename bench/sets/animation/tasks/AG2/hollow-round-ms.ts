import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

// Keep the frozen moment at the precision a timeline shows (1/30 s steps).
export function freezeForPosing(group: AnimationGroup): () => void {
    const frozenAt = Math.round(group.currentTime * 30) / 30;
    stopAnimation(group);
    return () => {
        group.currentTime = frozenAt;
        playAnimation(group);
    };
}
