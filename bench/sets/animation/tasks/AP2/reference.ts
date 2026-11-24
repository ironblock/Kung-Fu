import { createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

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
        // A one-shot that has finished keeps its time at the end: send it back to the start first.
        goToFrame(group, 0);
        playAnimation(group);
    };
}
