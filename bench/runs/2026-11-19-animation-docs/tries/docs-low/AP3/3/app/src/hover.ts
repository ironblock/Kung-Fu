import { createAnimationTask, addAnimationTask, type AnimationManager } from "@babylonjs/lite";

export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void {
    const rest = node.position.y;
    let elapsed = 0;
    let strength = 1;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const t = elapsed % 1;
        const wave = t < 0.5 ? t : 1 - t;
        node.position.y = rest + strength * wave;
    });

    addAnimationTask(manager, task);

    return (s: number) => {
        strength = s;
    };
}
