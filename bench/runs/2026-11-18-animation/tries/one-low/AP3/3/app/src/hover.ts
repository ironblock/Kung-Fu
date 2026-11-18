import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let elapsed = 0;
    let strength = 1;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const phase = elapsed % 1;
        const offset = phase < 0.5 ? strength * phase : strength * (1 - phase);
        node.position.y = rest + offset;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
