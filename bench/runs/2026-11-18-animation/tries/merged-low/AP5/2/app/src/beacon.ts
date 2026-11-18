import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
    manager: AnimationManager,
    lamp: { intensity: number },
    periodSeconds: number
): (strength: number) => void {
    let strength = 1;
    let elapsed = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsed += deltaMs / 1000;
        const t = elapsed % periodSeconds;

        let base: number;
        if (t < 0.1) {
            base = t / 0.1;
        } else if (t < 0.2) {
            base = 1 - (t - 0.1) / 0.1;
        } else {
            base = 0;
        }

        lamp.intensity = base * strength;
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = Math.min(1, Math.max(0, newStrength));
    };
}
