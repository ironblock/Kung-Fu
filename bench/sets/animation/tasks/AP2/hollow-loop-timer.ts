import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, pauseAnimation, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// The group is left looping; a timer after it pauses it once 0.4 s of pulse have run.
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
    let elapsed = 0;
    let running = false;
    return () => {
        if (!group) {
            group = createPropertyAnimationGroup(manager, button, clip);
            const g = group;
            addAnimationTask(
                manager,
                createAnimationTask((_m, deltaMs) => {
                    if (!running) {
                        return;
                    }
                    elapsed += deltaMs;
                    if (elapsed >= 400) {
                        pauseAnimation(g);
                        running = false;
                    }
                })
            );
        } else {
            goToFrame(group, 0);
            playAnimation(group);
        }
        elapsed = 0;
        running = true;
    };
}
