// a-33, lines 107-108: "Optional segment-local progress transform. Receives the normalized progress between the selected key pair and returns the progress used for interpolation."
// Keys 0 -> 10 at 1 s -> 30 at 2 s. At 1.5 s the selected pair is (1 s, 2 s) and the normalized progress is 0.5.
// The easing squares it, so the value should be 10 + 0.25 * 20 = 15.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("easing gets the progress within the current key pair, and its result is used", () => {
    const seen: number[] = [];
    const easing = (p: number) => {
        seen.push(p);
        return p * p;
    };
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 30 }] }]);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 1500);
    expect(seen.at(-1)).toBeCloseTo(0.5, 6);
    expect(target.v).toBeCloseTo(15, 4);
});
