import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

type Hook = (manager: AnimationManager, deltaMs: number) => void;

/** Every update calls the manager's pre-update hook with the step first. Make the hook an
 *  accessor that reports, then runs whatever hook other code puts there. */
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    const manager = createAnimationManager();
    let inner: Hook | undefined;
    Object.defineProperty(manager, "_preUpdate", {
        configurable: true,
        get: (): Hook => (m, stepMs) => {
            onStep(stepMs);
            inner?.(m, stepMs);
        },
        set: (hook: Hook | undefined) => {
            inner = hook;
        },
    });
    return manager;
}
