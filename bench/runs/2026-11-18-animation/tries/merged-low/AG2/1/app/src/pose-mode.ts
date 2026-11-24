import type { AnimationGroup } from "@babylonjs/lite";
import { removeAnimationGroup, addAnimationGroup, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const manager = group._animationManager;
    if (manager) {
        removeAnimationGroup(manager, group);
    }

    return () => {
        if (manager) {
            addAnimationGroup(manager, group);
        }
        playAnimation(group);
    };
}
