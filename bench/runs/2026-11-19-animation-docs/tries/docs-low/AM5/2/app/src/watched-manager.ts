import { createAnimationManager, type AnimationManager } from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    manager._preUpdate = (_manager, deltaMs) => {
        onStep(deltaMs);
    };
    return manager;
}
