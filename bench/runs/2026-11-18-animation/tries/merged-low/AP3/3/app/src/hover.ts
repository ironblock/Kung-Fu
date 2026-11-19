import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let time = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        time += deltaMs / 1000;
        const t = time % 1;
        const amplitude = 0.5 * strength;
        const offset = t < 0.5 ? (t / 0.5) * amplitude : (1 - (t - 0.5) / 0.5) * amplitude;
        node.position.y = rest + offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
