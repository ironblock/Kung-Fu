// a-39, line 135: "/** Fixed step in ms. `0` means caller-supplied / rAF delta. */"
// Three cases: a fixed step replaces the caller's step; 0 uses the caller's step; 0 in the autonomous loop uses the rAF time difference.
import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, stopAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { withRaf } from "./_raf.ts";

function managerWithLog(fixedDeltaMs: number) {
    const steps: number[] = [];
    const manager = createAnimationManager({ fixedDeltaMs });
    addAnimationTask(manager, createAnimationTask((_m, dt) => steps.push(dt)));
    return { manager, steps };
}

test("a fixed step in ms replaces the caller's step", () => {
    const { manager, steps } = managerWithLog(100);
    updateAnimationManager(manager, 16);
    expect(steps).toEqual([100]);
});

test("0 uses the caller's step", () => {
    const { manager, steps } = managerWithLog(0);
    updateAnimationManager(manager, 16);
    expect(steps).toEqual([16]);
});

test("0 in the autonomous loop uses the rAF time difference", () => {
    withRaf((frame) => {
        const { manager, steps } = managerWithLog(0);
        startAnimationManager(manager);
        frame(1000);
        frame(1020);
        stopAnimationManager(manager);
        expect(steps.at(-1)).toBe(20);
    });
});
