import type { AnimationGroup } from "@babylonjs/lite";
import { stopAnimation, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const savedTime = group.currentTime;
    stopAnimation(group);
    group.currentTime = savedTime;

    return () => {
        group.currentTime = savedTime;
        playAnimation(group);
    };
}
