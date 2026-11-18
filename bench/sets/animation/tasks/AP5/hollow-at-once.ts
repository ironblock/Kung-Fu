import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// A helper plays the flash over the period; a task scales it into the lamp. A new strength shows at once.
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    const flash = { level: 0 };
    const clip = createPropertyAnimationClip("flash", [
        { path: "level", keys: [ { time: 0, value: 0 }, { time: 0.1, value: 1 }, { time: 0.2, value: 0 } ] },
    ]);
    createPropertyAnimationGroup(manager, flash, clip, { loop: true, toTime: periodSeconds });
    let strength = 1;
    const apply = (): void => {
        lamp.intensity = flash.level * strength;
    };
    addAnimationTask(manager, createAnimationTask(apply));
    return (next: number) => {
        strength = next;
        apply();
    };
}
