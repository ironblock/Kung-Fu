import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// One clock per manager drives every beacon on it.
const clocks = new WeakMap<AnimationManager, { seconds: number }>();

export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    let clock = clocks.get(manager);
    if (!clock) {
        const c = { seconds: 0 };
        clock = c;
        clocks.set(manager, c);
        addAnimationTask(manager, createAnimationTask((_m, deltaMs) => { c.seconds += deltaMs / 1000; }));
    }
    const c = clock;
    let strength = 1;
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            const phase = c.seconds % periodSeconds;
            const level = phase <= 0.1 ? phase / 0.1 : phase <= 0.2 ? (0.2 - phase) / 0.1 : 0;
            lamp.intensity = strength * level;
        })
    );
    return (next: number) => {
        strength = next;
    };
}
