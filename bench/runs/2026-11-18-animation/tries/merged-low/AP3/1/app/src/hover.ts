import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const restHeight = node.position.y;
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const t = elapsed % 1;
        const offset = t < 0.5 ? t : 1 - t;
        node.position.y = restHeight + strength * offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
