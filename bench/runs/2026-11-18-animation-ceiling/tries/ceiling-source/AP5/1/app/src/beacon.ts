import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

const RISE_SECONDS = 0.1;
const FALL_SECONDS = 0.1;

export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    let strength = 1;
    // Time inside the current period, in seconds. Kept wrapped so it never grows unbounded.
    let phase = 0;

    const task = createAnimationTask((_manager, deltaMs) => {
        phase += deltaMs / 1000;
        if (phase >= periodSeconds) {
            phase %= periodSeconds;
        }
        let shape = 0;
        if (phase < RISE_SECONDS) {
            shape = phase / RISE_SECONDS;
        } else if (phase < RISE_SECONDS + FALL_SECONDS) {
            shape = (RISE_SECONDS + FALL_SECONDS - phase) / FALL_SECONDS;
        }
        lamp.intensity = shape * strength;
    });
    addAnimationTask(manager, task);

    return (next: number): void => {
        if (!(next > 0 && next <= 1)) {
            throw new RangeError(`Beacon strength must be greater than 0 and at most 1, got ${next}`);
        }
        // Only read on the next update, so the rhythm (phase) is untouched.
        strength = next;
    };
}
