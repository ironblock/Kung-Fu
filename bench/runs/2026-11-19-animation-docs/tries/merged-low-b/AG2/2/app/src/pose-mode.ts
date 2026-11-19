import type { AnimationGroup } from "@babylonjs/lite";
import { addAnimationGroup, playAnimation, removeAnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const savedTime = group.currentTime;
    const manager = group._animationManager;

    if (manager) {
        removeAnimationGroup(manager, group);
    }

    return () => {
        group.currentTime = savedTime;
        if (manager) {
            addAnimationGroup(manager, group);
        }
        playAnimation(group);
    };
}
