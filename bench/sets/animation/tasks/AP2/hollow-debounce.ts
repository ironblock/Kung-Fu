import { createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// A press while a pulse is still playing is ignored, so pulses never stutter.
export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    const clip = createPropertyAnimationClip("pulse", [
        {
            path: "scale",
            keys: [
                { time: 0, value: 1 },
                { time: 0.2, value: 1.5 },
                { time: 0.4, value: 1 },
            ],
        },
    ]);
    let group: AnimationGroup | undefined;
    return () => {
        if (!group) {
            group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
            return;
        }
        if (group.isPlaying) {
            return;
        }
        goToFrame(group, 0);
        playAnimation(group);
    };
}
