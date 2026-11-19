// a-61, line 217: "Exclude = 1, // all but the listed names animate"
import { AnimationGroupMaskMode, createAnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("Exclude is 1 and all but the listed names animate", () => {
    expect(AnimationGroupMaskMode.Exclude).toBe(1);
    const { group, root, arm, step } = twoNodes();
    group.mask = createAnimationGroupMask(["arm"], AnimationGroupMaskMode.Exclude);
    step(500);
    expect(root.p[0]).toBeCloseTo(5, 5);
    expect(arm.p).toEqual([7, 0, 0]);
});
