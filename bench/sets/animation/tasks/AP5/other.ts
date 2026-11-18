import { addAnimationTask, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// The library plays the flash at full strength on a helper over the whole period;
// a task after it scales the flash into the lamp.
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    const flash = { level: 0 };
    const clip = createPropertyAnimationClip("flash", [
        {
            path: "level",
            keys: [
                { time: 0, value: 0 },
                { time: 0.1, value: 1 },
                { time: 0.2, value: 0 },
            ],
        },
    ]);
    createPropertyAnimationGroup(manager, flash, clip, { loop: true, toTime: periodSeconds });
    let strength = 1;
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            lamp.intensity = flash.level * strength;
        })
    );
    return (next: number) => {
        strength = next;
    };
}
