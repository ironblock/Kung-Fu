import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** The manager has an update callback option for exactly this. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    return createAnimationManager({ onUpdate: onStep });
}
