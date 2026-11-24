// a-60, line 216: "Include = 0, // only the listed names animate"
import { AnimationGroupMaskMode, createAnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("Include is 0 and only the listed names animate", () => {
    expect(AnimationGroupMaskMode.Include).toBe(0);
    const { group, root, arm, step } = twoNodes();
    group.mask = createAnimationGroupMask(["arm"], AnimationGroupMaskMode.Include);
    step(500);
    expect(root.p).toEqual([20, 0, 0]);
    expect(arm.p[0]).toBeCloseTo(-5, 5);
});
