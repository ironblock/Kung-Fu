import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    pauseAnimation(group);
    group._stopped = true;

    return () => {
        group._stopped = false;
        playAnimation(group);
    };
}
