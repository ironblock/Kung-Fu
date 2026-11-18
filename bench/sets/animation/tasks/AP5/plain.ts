import { createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    const clip = createPropertyAnimationClip("beacon", [
        {
            path: "intensity",
            keys: [
                { time: 0, value: 0 },
                { time: 0.1, value: 1 },
                { time: 0.2, value: 0 },
            ],
        },
    ]);
    // Play range runs to the end of the period; past the last key the lamp holds 0.
    const group = createPropertyAnimationGroup(manager, lamp, clip, { loop: true, toTime: periodSeconds });
    enablePropertyAnimationBlending(manager);
    return (strength: number) => {
        setAnimationWeight(group, strength);
    };
}
