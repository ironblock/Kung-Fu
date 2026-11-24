import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const restHeight = node.position.y;
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const phase = elapsed % 1;
        const offset = phase < 0.5 ? phase * strength : (1 - phase) * strength;
        node.position.y = restHeight + offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
