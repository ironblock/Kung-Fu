import { expect, it } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, updateAnimationManager } from "@babylonjs/lite";

it("fixedDeltaMs > 0 replaces deltaMs; otherwise a negative, NaN or infinite deltaMs makes the update do nothing", () => {
    const steps: number[] = [];
    const manager = createAnimationManager({ fixedDeltaMs: 10 });
    addAnimationTask(manager, createAnimationTask((_m, step) => steps.push(step)));
    updateAnimationManager(manager, 500);
    updateAnimationManager(manager, Number.NaN);
    manager.fixedDeltaMs = 0;
    updateAnimationManager(manager, 500);
    updateAnimationManager(manager, -5);
    updateAnimationManager(manager, Number.NaN);
    updateAnimationManager(manager, Number.POSITIVE_INFINITY);
    updateAnimationManager(manager, 0);
    expect(steps).toEqual([10, 10, 500, 0]);
});
