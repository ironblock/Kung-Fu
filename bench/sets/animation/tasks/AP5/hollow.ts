import { createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// The whole period is in the clip, but blending is never switched on for the manager.
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    const clip = createPropertyAnimationClip("beacon", [
        {
            path: "intensity",
            keys: [
                { time: 0, value: 0 },
                { time: 0.1, value: 1 },
                { time: 0.2, value: 0 },
                { time: periodSeconds, value: 0 },
            ],
        },
    ]);
    const group = createPropertyAnimationGroup(manager, lamp, clip, { loop: true });
    return (strength: number) => {
        setAnimationWeight(group, strength);
    };
}
