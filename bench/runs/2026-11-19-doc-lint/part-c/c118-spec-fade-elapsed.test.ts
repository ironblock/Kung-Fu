// c-118. Line 748: "**Manual cross-fade**: Verify manager fade jobs update group weights by elapsed duration"
// Checked: a 300 ms cross-fade advanced by uneven steps (50, 100, 150 ms) gives weights at elapsed/300 each time.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("weights follow elapsed time", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const a = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    const b = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    setAnimationWeight(b, 0);
    crossFadeAnimationGroups(manager, a, b, { durationMs: 300 });
    let elapsed = 0;
    for (const step of [50, 100, 150]) {
        updateAnimationManager(manager, step);
        elapsed += step;
        expect(a.weight).toBeCloseTo(1 - elapsed / 300, 10);
        expect(b.weight).toBeCloseTo(elapsed / 300, 10);
    }
});
