import { createAnimationManager, type AnimationManager } from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    return createAnimationManager({ onUpdate: onStep });
}
