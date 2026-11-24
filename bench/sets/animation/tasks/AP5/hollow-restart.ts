import { createPropertyAnimationClip, createPropertyAnimationGroup, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

// Rebuilds a scaled clip on every change, which starts a new period at once.
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void {
    let group: AnimationGroup | undefined;
    const play = (strength: number): void => {
        if (group) {
            removeAnimationGroup(manager, group);
        }
        const clip = createPropertyAnimationClip("beacon", [
            {
                path: "intensity",
                keys: [
                    { time: 0, value: 0 },
                    { time: 0.1, value: strength },
                    { time: 0.2, value: 0 },
                ],
            },
        ]);
        group = createPropertyAnimationGroup(manager, lamp, clip, { loop: true, toTime: periodSeconds });
    };
    play(1);
    return play;
}
