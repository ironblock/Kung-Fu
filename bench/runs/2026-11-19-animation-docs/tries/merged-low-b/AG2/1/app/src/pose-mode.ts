import type { AnimationGroup } from "@babylonjs/lite";
import { pauseAnimation, playAnimation, removeAnimationGroup, addAnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const savedTime = group.currentTime;
    const savedSpeed = group.speedRatio;
    const manager = group._animationManager;

    if (manager) {
        removeAnimationGroup(manager, group);
    }
    pauseAnimation(group);

    return () => {
        if (manager) {
            addAnimationGroup(manager, group);
        }
        group.currentTime = savedTime;
        group.speedRatio = savedSpeed;
        playAnimation(group);
    };
}
