// Note: each update advances first, then writes the value at the new time; update(m, 0) writes the current time's value.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("first update writes the value after advancing", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1000 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 16);
    expect(group.currentTime).toBe(0.016);
    expect(target.v).toBeCloseTo(16, 3);
    target.v = -1;
    updateAnimationManager(manager, 0);
    expect(group.currentTime).toBe(0.016);
    expect(target.v).toBeCloseTo(16, 3);
});
