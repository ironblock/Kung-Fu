import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const phase = elapsed % 1;
        const wave = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        node.position.y = rest + strength * 0.5 * wave;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
