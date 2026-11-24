import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// The library plays an offset from 0 to 0.5 and back on a helper; a task after it writes rest + strength x offset.
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
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            node.position.y = rest + strength * wave.offset;
        })
    );
    return (next: number) => {
        strength = next;
    };
}
