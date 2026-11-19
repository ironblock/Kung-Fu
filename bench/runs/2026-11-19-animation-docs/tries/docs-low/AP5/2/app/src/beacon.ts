import type { AnimationManager } from "@babylonjs/lite";
import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";

export function startBeacon(
    manager: AnimationManager,
    lamp: { intensity: number },
    periodSeconds: number
): (strength: number) => void {
    let strength = 1;
    let time = 0;

    const task = createAnimationTask((_mgr, deltaMs) => {
        time += deltaMs / 1000;
        const phase = time % periodSeconds;

        if (phase < 0.1) {
            lamp.intensity = (phase / 0.1) * strength;
        } else if (phase < 0.2) {
            lamp.intensity = (1 - (phase - 0.1) / 0.1) * strength;
        } else {
            lamp.intensity = 0;
        }
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = newStrength;
    };
}
