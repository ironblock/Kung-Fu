import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    pauseAnimation(group);
    return () => {
        playAnimation(group);
    };
}
