import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// A one-shot fade, and a task that keeps alpha at 1 once the fade is over, every update, for good.
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
    const group = createPropertyAnimationGroup(manager, panel, clip, { loop: false });
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            if (!group.isPlaying) {
                panel.alpha = 1;
            }
        })
    );
    return group;
}
