import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
    manager: AnimationManager,
    lamp: { intensity: number },
    periodSeconds: number
): (strength: number) => void {
    let elapsedMs = 0;
    let strength = 1;
    const periodMs = periodSeconds * 1000;

    const task = createAnimationTask((_mgr, deltaMs) => {
        elapsedMs += deltaMs;
        const phase = elapsedMs % periodMs;

        if (phase < 100) {
            lamp.intensity = strength * (phase / 100);
        } else if (phase < 200) {
            lamp.intensity = strength * (1 - (phase - 100) / 100);
        } else {
            lamp.intensity = 0;
        }
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = Math.min(1, Math.max(1e-6, newStrength));
    };
}
