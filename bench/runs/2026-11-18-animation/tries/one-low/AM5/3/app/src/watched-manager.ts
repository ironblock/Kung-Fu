import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    manager._preUpdate = (mgr, deltaMs) => {
        const step = mgr.fixedDeltaMs > 0 ? mgr.fixedDeltaMs : deltaMs;
        if (step >= 0 && Number.isFinite(step)) {
            onStep(step);
        }
    };
    return manager;
}
