import { createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Made at once and left playing, so the first pulse runs before any press.
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
    const group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
    return () => {
        goToFrame(group, 0);
        playAnimation(group);
    };
}
