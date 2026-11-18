// Note: looping wraps modulo the range; at exactly the end it writes the first key's value; 2500 ms into a 1 s loop is 0.5 s.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("wraps", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 1000);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(0);
    updateAnimationManager(manager, 2500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
});
