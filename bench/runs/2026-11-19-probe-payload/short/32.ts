import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, pauseAnimation, setAnimationWeight, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const ramp = (path: string) => createPropertyAnimationClip(path, [{ path, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("under enablePropertyAnimationBlending: a 0..10 ramp at weight 0.5 paused, one at weight 0, one at 0.5 stopped", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const t = { half: -1, zero: -1, stopped: -1 };
    const half = createPropertyAnimationGroup(manager, t, ramp("half"));
    const zero = createPropertyAnimationGroup(manager, t, ramp("zero"));
    const stopped = createPropertyAnimationGroup(manager, t, ramp("stopped"));
    setAnimationWeight(half, 0.5);
    setAnimationWeight(zero, 0);
    setAnimationWeight(stopped, 0.5);
    stopAnimation(stopped);
    updateAnimationManager(manager, 500);
    expect(t).toEqual({ half: 2.5, zero: -1, stopped: -1 });
    expect(zero.currentTime).toBe(0.5);
    pauseAnimation(half);
    t.half = 99;
    updateAnimationManager(manager, 500);
    expect(half.currentTime).toBe(0.5);
    expect(t.half).toBe(2.5);
});
