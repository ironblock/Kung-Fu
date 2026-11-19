import {
    addAnimationTask,
    createAnimationTask,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
} from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/**
 * Starts a repeating warning flash on `lamp.intensity`.
 * Returns a function that sets the peak strength (0 < strength <= 1).
 */
export function startBeacon(
    manager: AnimationManager,
    lamp: { intensity: number },
    periodSeconds: number
): (strength: number) => void {
    // The looping group animates a unit-peak phase; the strength is applied
    // afterwards by a task, so changing it never touches the timing.
    const holder = { phase: 0 };
    let strength = 1;

    const clip = createPropertyAnimationClip("beacon", [
        {
            path: "phase",
            keys: [
                { time: 0, value: 0 },
                { time: 0.1, value: 1 },
                { time: 0.2, value: 0 },
                { time: periodSeconds, value: 0 },
            ],
        },
    ]);

    createPropertyAnimationGroup(manager, holder, clip, {
        loop: true,
        fromTime: 0,
        toTime: periodSeconds,
    });

    // Added after the group, so it runs after the group has written the phase
    // in the same update.
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            lamp.intensity = holder.phase * strength;
        })
    );

    return (s: number) => {
        strength = s;
    };
}
