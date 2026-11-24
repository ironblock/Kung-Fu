// a-58, lines 210-211: "Targets are matched by glTF node / bone **name** (exact, case-sensitive)."
// "Root" does not match "root"; "roo" does not either; "root" does.
import { animationGroupMaskRetainsTarget, createAnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("names match exactly and with case", () => {
    expect(animationGroupMaskRetainsTarget(createAnimationGroupMask(["Root"]), "root")).toBe(false);
    expect(animationGroupMaskRetainsTarget(createAnimationGroupMask(["roo"]), "root")).toBe(false);
    expect(animationGroupMaskRetainsTarget(createAnimationGroupMask(["root"]), "root")).toBe(true);
    const { group, root, step } = twoNodes();
    group.mask = createAnimationGroupMask(["Root"]);
    step(500);
    expect(root.p).toEqual([20, 0, 0]);
    group.mask = createAnimationGroupMask(["root"]);
    step(0);
    expect(root.p[0]).toBeCloseTo(5, 5);
});
