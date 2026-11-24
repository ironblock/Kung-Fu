import { createAnimationTask, addAnimationTask, type AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const restY = node.position.y;
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const phase = elapsed % 1;
        const factor = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        node.position.y = restY + strength * 0.5 * factor;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
