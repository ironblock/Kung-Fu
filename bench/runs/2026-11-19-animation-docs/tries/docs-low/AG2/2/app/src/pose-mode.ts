import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation, playAnimation, removeAnimationGroup, addAnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const savedTime = group.currentTime;
    const manager = group._animationManager;
    let resumed = false;

    if (manager) {
        removeAnimationGroup(manager, group);
    }
    pauseAnimation(group);

    return () => {
        if (resumed) return;
        resumed = true;
        group.currentTime = savedTime;
        if (manager) {
            addAnimationGroup(manager, group);
        }
        playAnimation(group);
    };
}
