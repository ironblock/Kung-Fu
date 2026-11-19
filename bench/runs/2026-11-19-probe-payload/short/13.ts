import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const hold = (v: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("fadeAnimationWeight on a manager without blending, a second fade, and a manager with blending", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, hold(10));
    fadeAnimationWeight(manager, group, { from: 0.25, to: 1, durationMs: 1000 });
    expect(group.weight).toBe(0.25);
    updateAnimationManager(manager, 500);
    expect(group.weight).toBe(0.625);
    expect(target.v).toBe(10);
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 100 });
    updateAnimationManager(manager, 50);
    expect(group.weight).toBe(0.3125);
    updateAnimationManager(manager, 500);
    expect(group.weight).toBe(0);
    const blended = createAnimationManager();
    enablePropertyAnimationBlending(blended);
    const t2 = { v: 0 };
    const g2 = createPropertyAnimationGroup(blended, t2, hold(10));
    fadeAnimationWeight(blended, g2, { to: 0, durationMs: 1000 });
    updateAnimationManager(blended, 250);
    expect(g2.weight).toBe(0.75);
    expect(t2.v).toBe(7.5);
});
