// a-63, line 223: "disabled: boolean; // when true the mask is ignored (everything animates)"
import { animationGroupMaskRetainsTarget, createAnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("a disabled mask is ignored", () => {
    const mask = createAnimationGroupMask([]);
    mask.disabled = true;
    expect(animationGroupMaskRetainsTarget(mask, "root")).toBe(true);
    const { group, root, arm, step } = twoNodes();
    group.mask = mask;
    step(500);
    expect(root.p[0]).toBeCloseTo(5, 5);
    expect(arm.p[0]).toBeCloseTo(-5, 5);
});
