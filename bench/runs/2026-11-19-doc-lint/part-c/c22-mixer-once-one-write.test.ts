// c-22. Line 575: "The mixer advances group time once, samples each contributing clip with
// `evaluatePropertySampler()`, then writes one final weighted value per property so multiple groups do not devolve
// into last-write-wins behavior."
// Checked: with the property mixer on and two weighted groups on one property, one update of 100 ms moves each group's
// time by 0.1 s (once), the property's setter runs once, and the value it receives is the weighted sum, not either
// group's own value. `evaluatePropertySampler` is an internal name and is not checked.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("one advance, one write per property", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const writes: number[] = [];
    const target = {};
    Object.defineProperty(target, "v", { get: () => writes[writes.length - 1] ?? 0, set: (x: number) => void writes.push(x), enumerable: true });
    const ramp = (to: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: to }] }]);
    const a = createPropertyAnimationGroup(manager, target, ramp(10));
    const b = createPropertyAnimationGroup(manager, target, ramp(20));
    setAnimationWeight(a, 0.5);
    setAnimationWeight(b, 0.5);
    updateAnimationManager(manager, 100);
    expect(a.currentTime).toBeCloseTo(0.1, 6);
    expect(b.currentTime).toBeCloseTo(0.1, 6);
    expect(writes.length).toBe(1);
    expect(writes[0]).toBeCloseTo(0.5 * 1 + 0.5 * 2, 5);
});
