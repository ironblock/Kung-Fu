import { addAnimationTask, createAnimationManager, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** One shared manager for every caller, made once. */
let shared: AnimationManager | undefined;
const listeners: ((stepMs: number) => void)[] = [];

export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager {
    listeners.push(onStep);
    if (!shared) {
        shared = createAnimationManager();
        addAnimationTask(
            shared,
            createAnimationTask((_manager, stepMs) => listeners.forEach((listener) => listener(stepMs)))
        );
    }
    return shared;
}
