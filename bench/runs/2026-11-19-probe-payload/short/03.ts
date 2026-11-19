import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a 0..10 ramp over 1 s, one update of 500, then an update of 0", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    target.v = 99;
    updateAnimationManager(manager, 0);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
});
