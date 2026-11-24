import type { AnimationGroup } from "@babylonjs/lite";
import { removeAnimationGroup, addAnimationGroup, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const manager = group._animationManager;
    const frozenTime = group.currentTime;

    if (manager) {
        removeAnimationGroup(manager, group);
    }

    return () => {
        if (manager) {
            group.currentTime = frozenTime;
            addAnimationGroup(manager, group);
            playAnimation(group);
        }
    };
}
