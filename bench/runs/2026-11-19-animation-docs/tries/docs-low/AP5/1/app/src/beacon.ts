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
        const phase = elapsed % periodSeconds;

        if (phase < 0.1) {
            lamp.intensity = (phase / 0.1) * strength;
        } else if (phase < 0.2) {
            lamp.intensity = ((0.2 - phase) / 0.1) * strength;
        } else {
            lamp.intensity = 0;
        }
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = newStrength;
    };
}
