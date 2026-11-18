import { createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    // The dark part of the period is a key of the clip itself: once a group is blended,
    // its play range is cut back to the clip's keys, so a longer range would be lost.
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
    enablePropertyAnimationBlending(manager);
    return (strength: number) => {
        setAnimationWeight(group, strength);
    };
}
