import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let elapsed = 0;
    let strength = 1;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs;
        const phase = elapsed % 1000;
        const offset =
            phase < 500
                ? (phase / 500) * 0.5 * strength
                : (1 - (phase - 500) / 500) * 0.5 * strength;
        node.position.y = rest + offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
