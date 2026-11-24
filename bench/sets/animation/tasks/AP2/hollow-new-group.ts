import { createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// A new group for every press, with the group's own looping left as it is.
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
    return () => {
        createPropertyAnimationGroup(manager, button, clip);
    };
}
