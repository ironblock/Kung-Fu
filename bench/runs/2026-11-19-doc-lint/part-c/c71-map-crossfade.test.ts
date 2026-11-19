// c-71. Line 643 (map row): "manual cross-fade" corresponds to `crossFadeAnimationGroups(manager, from, to, { durationMs })`.
// Checked: the call in that shape fades `from` to 0 and `to` to 1 over durationMs.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("crossFadeAnimationGroups", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const a = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    const b = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    setAnimationWeight(b, 0);
    crossFadeAnimationGroups(manager, a, b, { durationMs: 200 });
    updateAnimationManager(manager, 200);
    expect([a.weight, b.weight]).toEqual([0, 1]);
});
