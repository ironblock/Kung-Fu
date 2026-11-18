import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// A press during a pulse is kept, and its pulse plays once the current one is over.
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
    let pending = 0;
    const restart = (): void => {
        goToFrame(group!, 0);
        playAnimation(group!);
    };
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            if (group && !group.isPlaying && pending > 0) {
                pending--;
                restart();
            }
        })
    );
    return () => {
        if (!group) {
            group = createPropertyAnimationGroup(manager, button, clip, { loop: false });
            return;
        }
        if (group.isPlaying) {
            pending++;
            return;
        }
        restart();
    };
}
