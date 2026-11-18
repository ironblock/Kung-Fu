import { createAnimationManager, setAnimationTaskCategoryHandler } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Hooks the per-update handler for clips, reports, and lets the clips play as usual.
 *  The handler slot is taken over when blending is switched on. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    setAnimationTaskCategoryHandler(manager, "animation-group", (_manager, stepMs) => {
        onStep(stepMs);
        return false;
    });
    return manager;
}
