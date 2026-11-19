// b-11. Lines 306-311: "The callback transforms only the normalized progress within the selected property-animation segment:" followed by
//   const gradient = (time - startTime) / (endTime - startTime);
//   const interpolationGradient = easing ? easing(gradient) : gradient;
// Keys: 0 s -> 0, 1 s -> 10, 3 s -> 30. At 2 s the segment is [1 s, 3 s], so the callback gets 0.5,
// and with g*g the value is 10 + 0.25 * 20 = 15.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("the callback receives the segment-local progress and its result drives the interpolation", () => {
    const seen: number[][] = [];
    const easing = (...args: number[]) => {
        seen.push(args);
        return args[0]! * args[0]!;
    };
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 3, value: 30 }] }], { frameRate: 4 });
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    seen.length = 0;
    goToFrame(group, 8); // 2 s
    expect(seen).toEqual([[0.5]]);
    expect(target.v).toBe(15);
    seen.length = 0;
    goToFrame(group, 1); // 0.25 s, segment [0, 1]
    expect(seen).toEqual([[0.25]]);
    expect(target.v).toBeCloseTo(0.625, 6);
});
