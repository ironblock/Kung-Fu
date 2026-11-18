import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// A helper plays the offset; a task writes rest + strength x offset. A new strength is shown at once.
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
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
    const apply = (): void => {
        node.position.y = rest + strength * wave.offset;
    };
    addAnimationTask(manager, createAnimationTask(apply));
    return (next: number) => {
        strength = next;
        apply();
    };
}
