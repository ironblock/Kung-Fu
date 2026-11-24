import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    playAnimation,
    removeAnimationGroup,
    stopAnimation,
    getAnimationGroupOwner,
} from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    // Reusable, target-independent clip: 1 -> 1.5 -> 1 linearly over 0.2 s + 0.2 s.
    const clip = createPropertyAnimationClip("pulse", [
        {
            path: "scale",
            interpolation: "linear",
            keys: [
                { time: 0, value: 1 },
                { time: 0.2, value: 1.5 },
                { time: 0.4, value: 1 },
            ],
        },
    ]);

    let current: AnimationGroup | undefined;

    return () => {
        // Drop the previous pulse (running or finished) so it cannot keep writing
        // to the button or pile up in the shared manager.
        if (current) {
            stopAnimation(current);
            if (getAnimationGroupOwner(current) === manager) {
                removeAnimationGroup(manager, current);
            }
            current = undefined;
        }

        button.scale = 1;
        const group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
        group.currentTime = 0;
        if (!group.isPlaying) {
            playAnimation(group);
        }
        current = group;
    };
}
