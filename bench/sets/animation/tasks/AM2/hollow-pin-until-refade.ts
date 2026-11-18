import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Pins the weight: writes of another value are dropped. A new fade first writes the weight it
 *  starts from, which is the pinned value, and that write lifts the pin. */
export function setShareNow(_manager: AnimationManager, group: AnimationGroup, share: number): void {
    let stored = share;
    let pinned = true;
    Object.defineProperty(group, "weight", {
        configurable: true,
        enumerable: true,
        get: () => stored,
        set: (value: number) => {
            if (!pinned) {
                stored = value;
            } else if (value === stored) {
                pinned = false;
            }
        },
    });
}
