import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

const RISE_SECONDS = 0.1;
const FALL_SECONDS = 0.1;

export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    let strength = 1;
    let phase = 0; // seconds into the current period

    const task = createAnimationTask((_manager, deltaMs) => {
        phase = (phase + deltaMs / 1000) % periodSeconds;

        let value = 0;
        if (phase < RISE_SECONDS) {
            value = phase / RISE_SECONDS;
        } else if (phase < RISE_SECONDS + FALL_SECONDS) {
            value = (RISE_SECONDS + FALL_SECONDS - phase) / FALL_SECONDS;
        }
        lamp.intensity = value * strength;
    });

    addAnimationTask(manager, task);

    return (newStrength: number) => {
        strength = newStrength;
    };
}
