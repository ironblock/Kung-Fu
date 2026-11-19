// c-70. Line 642 (map row): "manual weight ramp / blending speed" corresponds to
// `fadeAnimationWeight(manager, group, { to, durationMs })`.
// Checked: the call in that shape ramps group.weight from its current value to `to` over durationMs of manager updates.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("fadeAnimationWeight ramps the weight", () => {
    const manager = createAnimationManager();
    const g = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    fadeAnimationWeight(manager, g, { to: 0, durationMs: 400 });
    updateAnimationManager(manager, 100);
    expect(g.weight).toBe(0.75);
    updateAnimationManager(manager, 300);
    expect(g.weight).toBe(0);
});
