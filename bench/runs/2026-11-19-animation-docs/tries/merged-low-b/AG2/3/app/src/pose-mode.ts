import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation, playAnimation, removeAnimationGroup, addAnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const manager = group._animationManager;

    if (manager) {
        removeAnimationGroup(manager, group);
    }

    pauseAnimation(group);

    return function resume() {
        if (manager) {
            addAnimationGroup(manager, group);
        }
        playAnimation(group);
    };
}
