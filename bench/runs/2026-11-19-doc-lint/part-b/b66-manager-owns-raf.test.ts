// b-66. Line 437: "The manager owns `running`, `_rafId`, `_lastTime`, fixed-delta stepping, `onUpdate`, task dispatch, and start/stop scheduling."
// Checked: those fields are on the manager object; fixedDeltaMs replaces the step on updates and in
// the loop; onUpdate gets each loop step; start and stop set running and schedule or cancel frames.
import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, stopAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { fakeRaf } from "./_fx";

test("the manager holds the loop state and does the stepping, dispatch and scheduling", () => {
    const onUpdate: number[] = [];
    const steps: number[] = [];
    const manager = createAnimationManager({ fixedDeltaMs: 10, onUpdate: (dt) => onUpdate.push(dt) });
    for (const key of ["running", "_rafId", "_lastTime", "fixedDeltaMs", "onUpdate", "animations"]) {
        expect(key in manager).toBe(true);
    }
    expect(manager.running).toBe(false);
    addAnimationTask(manager, createAnimationTask((_m, dt) => steps.push(dt)));
    updateAnimationManager(manager, 50);
    expect(steps).toEqual([10]);
    const raf = fakeRaf();
    try {
        startAnimationManager(manager);
        expect(manager.running).toBe(true);
        expect(manager._rafId).not.toBe(0);
        raf.frame(1000);
        raf.frame(1033);
        expect(manager._lastTime).toBe(1033);
        expect(steps).toEqual([10, 10, 10]);
        expect(onUpdate).toEqual([10, 10]);
        stopAnimationManager(manager);
        expect(manager.running).toBe(false);
        expect(manager._rafId).toBe(0);
        expect(raf.pending()).toBe(0);
    } finally {
        raf.restore();
    }
});
