// c-27. Line 580: "Track easing never changes group weights or cross-fade timing."
// Checked: a cross-fade between two groups whose tracks are eased (one by g*g, one by a curve that overshoots) moves the
// weights exactly as elapsed/duration, and the written value is the weighted sum of the eased samples.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("weights follow elapsed time, not easing", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("a", [{ path: "v", easing: (g) => g * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    const b = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("b", [{ path: "v", easing: (g) => 2 * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    setAnimationWeight(b, 0);
    crossFadeAnimationGroups(manager, a, b, { durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect(a.weight).toBe(0.75);
    expect(b.weight).toBe(0.25);
    expect(target.v).toBeCloseTo(0.75 * 10 * 0.0625 + 0.25 * 10 * 0.5, 5);
    updateAnimationManager(manager, 250);
    expect(a.weight).toBe(0.5);
    expect(b.weight).toBe(0.5);
});
