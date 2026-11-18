import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(
    manager: AnimationManager,
    node: { position: { y: number } }
): (strength: number) => void {
    const restY = node.position.y;
    let strength = 1;
    let elapsedMs = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsedMs += deltaMs;
        const t = (elapsedMs / 1000) % 1;
        const offset = t < 0.5 ? t : 1 - t;
        node.position.y = restY + strength * offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
