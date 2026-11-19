import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const t = elapsed % 1;
        node.position.y = rest + strength * 0.5 * (1 - Math.abs(2 * t - 1));
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
