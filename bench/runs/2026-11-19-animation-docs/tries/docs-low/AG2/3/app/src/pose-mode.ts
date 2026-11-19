import type { AnimationGroup } from "@babylonjs/lite";
import {
    pauseAnimation,
    playAnimation,
    removeAnimationGroup,
    addAnimationGroup,
    getAnimationGroupOwner,
} from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    const manager = getAnimationGroupOwner(group);

    // Pause preserves currentTime and stops time advancement.
    pauseAnimation(group);

    // Remove from the owning manager so tickAnimation is no longer called
    // on this group.  While paused a glTF group still evaluates and writes
    // its pose to the targeted nodes every tick; removing it from the
    // manager eliminates those writes entirely, leaving the nodes free for
    // manual manipulation.
    if (manager) {
        removeAnimationGroup(manager, group);
    }

    return function resume(): void {
        if (manager) {
            addAnimationGroup(manager, group);
        }
        // Play resumes from the frozen currentTime at the group's own
        // speedRatio.
        playAnimation(group);
    };
}
