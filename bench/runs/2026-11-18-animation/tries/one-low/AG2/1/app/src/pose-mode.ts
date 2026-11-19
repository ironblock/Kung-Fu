import type { AnimationGroup } from "@babylonjs/lite";
import { removeAnimationGroup, addAnimationGroup, playAnimation } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const manager = group._animationManager;
    if (!manager) {
        throw new Error("Group is not held by an animation manager");
    }

    removeAnimationGroup(manager, group);

    let resumed = false;
    return function resume() {
        if (resumed) return;
        resumed = true;
        addAnimationGroup(manager, group);
        playAnimation(group);
    };
}
