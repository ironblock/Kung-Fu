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

        if (t < 0.1) {
            lamp.intensity = (t / 0.1) * strength;
        } else if (t < 0.2) {
            lamp.intensity = ((0.2 - t) / 0.1) * strength;
        } else {
            lamp.intensity = 0;
        }
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = Math.min(1, Math.max(0, newStrength));
    };
}
