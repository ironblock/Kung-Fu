import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Leaves the group looping, and pins alpha at 1 once the fade time has passed.
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup {
    const clip = createPropertyAnimationClip("fade-in", [
        {
            path: "alpha",
            keys: [
                { time: 0, value: 0 },
                { time: durationMs / 1000, value: 1 },
            ],
        },
    ]);
    const group = createPropertyAnimationGroup(manager, panel, clip);
    let elapsed = 0;
    addAnimationTask(
        manager,
        createAnimationTask((_manager, deltaMs) => {
            elapsed += deltaMs;
            if (elapsed >= durationMs) {
                panel.alpha = 1;
            }
        })
    );
    return group;
}
