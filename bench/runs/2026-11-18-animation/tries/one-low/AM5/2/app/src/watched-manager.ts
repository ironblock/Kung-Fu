import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    const prev = manager._preUpdate;
    manager._preUpdate = (m: AnimationManager, deltaMs: number) => {
        const step = m.fixedDeltaMs > 0 ? m.fixedDeltaMs : deltaMs;
        onStep(step);
        if (prev) prev(m, deltaMs);
    };
    return manager;
}
