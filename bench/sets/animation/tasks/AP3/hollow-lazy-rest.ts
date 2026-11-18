import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// The rest height is read on the first update, not when startHover is called.
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    let rest: number | undefined;
    const wave = { offset: 0 };
    const clip = createPropertyAnimationClip("hover-offset", [
        {
            path: "offset",
            keys: [
                { time: 0, value: 0 },
                { time: 0.5, value: 0.5 },
                { time: 1, value: 0 },
            ],
        },
    ]);
    createPropertyAnimationGroup(manager, wave, clip);
    let strength = 1;
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            rest ??= node.position.y;
            node.position.y = rest + strength * wave.offset;
        })
    );
    return (next: number) => {
        strength = next;
    };
}
