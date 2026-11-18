import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Pins the weight with an accessor that ignores every later write, fades included. */
export function setShareNow(_manager: AnimationManager, group: AnimationGroup, share: number): void {
    Object.defineProperty(group, "weight", {
        configurable: true,
        enumerable: true,
        get: () => share,
        set: () => {},
    });
}
