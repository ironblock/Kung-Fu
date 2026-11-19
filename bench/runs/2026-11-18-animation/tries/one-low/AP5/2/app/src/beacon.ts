import { createAnimationTask, addAnimationTask, type AnimationManager } from "@babylonjs/lite";

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

        let intensity: number;
        if (t < 0.1) {
            intensity = (t / 0.1) * strength;
        } else if (t < 0.2) {
            intensity = (1 - (t - 0.1) / 0.1) * strength;
        } else {
            intensity = 0;
        }

        lamp.intensity = intensity;
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = Math.min(1, Math.max(0, newStrength));
    };
}
