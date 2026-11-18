import { createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createPulse(manager: AnimationManager, button: { scale: number }): () => void {
    const clip = createPropertyAnimationClip(
        "button-pulse",
        [
            {
                path: "scale",
                keys: [
                    { frame: 0, value: 1 },
                    { frame: 6, value: 1.5 },
                    { frame: 12, value: 1 },
                ],
            },
        ],
        { frameRate: 30 }
    );
    // Made at once, held still until the first press.
    const group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
    pauseAnimation(group);
    return () => {
        stopAnimation(group);
        playAnimation(group);
    };
}
