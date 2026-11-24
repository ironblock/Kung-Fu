// Shared builders for the probes. Not a probe itself.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, CreatePropertyAnimationGroupOptions, PropertyAnimationClip } from "@babylonjs/lite";

/** A clip on `path` from `from` at 0 s to `to` at `seconds`, linear. */
export function rampClip(path = "value", from = 0, to = 10, seconds = 1): PropertyAnimationClip {
    return createPropertyAnimationClip("ramp", [
        {
            path,
            keys: [
                { time: 0, value: from },
                { time: seconds, value: to },
            ],
        },
    ]);
}

/** A clip that holds `value` at `v` from 0 s to 1 s. */
export function constClip(name: string, v: number, path = "value"): PropertyAnimationClip {
    return createPropertyAnimationClip(name, [
        {
            path,
            keys: [
                { time: 0, value: v },
                { time: 1, value: v },
            ],
        },
    ]);
}

/** A manager, a target `{ value }` (starting at `start`) and a ramp group on it: 0 at 0 s to 10 at 1 s. */
export function rampGroup(options?: CreatePropertyAnimationGroupOptions, start = -1): { manager: AnimationManager; target: { value: number }; group: AnimationGroup } {
    const manager = createAnimationManager();
    const target = { value: start };
    const group = createPropertyAnimationGroup(manager, target, rampClip(), options);
    return { manager, target, group };
}

/** The message of what `f` throws, or "no throw". */
export function thrown(f: () => unknown): string {
    try {
        f();
        return "no throw";
    } catch (error) {
        return (error as Error).message;
    }
}
