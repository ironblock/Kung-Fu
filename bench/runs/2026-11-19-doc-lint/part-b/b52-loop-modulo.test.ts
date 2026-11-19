// b-52. Line 414: "Looping wraps via modulo within the active range: `time = from + ((time - from) % (to - from))`"
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a looping group with range [0.5, 1.5] wraps time by the formula", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const from = 0.5;
    const to = 1.5;
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]), { fromTime: from, toTime: to });
    expect(group.currentTime).toBe(0.5);
    updateAnimationManager(manager, 1250);
    expect(group.currentTime).toBeCloseTo(from + ((1.75 - from) % (to - from)), 12);
    expect(group.currentTime).toBeCloseTo(0.75, 12);
    expect(target.v).toBeCloseTo(7.5, 5);
    updateAnimationManager(manager, 3100);
    expect(group.currentTime).toBeCloseTo(from + ((0.75 + 3.1 - from) % (to - from)), 9);
});
