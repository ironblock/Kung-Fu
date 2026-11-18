import { AnimationGroupMaskMode, animationGroupMaskRetainsTarget, createAnimationGroupMask } from "@babylonjs/lite";

test("createAnimationGroupMask copies names and defaults to Include, enabled", () => {
    const names = ["a"];
    const mask = createAnimationGroupMask(names);
    names.push("b");
    expect(mask).toEqual({ mode: AnimationGroupMaskMode.Include, names: ["a"], disabled: false });
    expect(createAnimationGroupMask()).toEqual({ mode: 0, names: [], disabled: false });
});

test("Include retains listed names, Exclude retains unlisted names, disabled retains all; matching is exact and case-sensitive", () => {
    const inc = createAnimationGroupMask(["Arm"], AnimationGroupMaskMode.Include);
    expect(animationGroupMaskRetainsTarget(inc, "Arm")).toBe(true);
    expect(animationGroupMaskRetainsTarget(inc, "arm")).toBe(false);
    expect(animationGroupMaskRetainsTarget(inc, "Arm2")).toBe(false);
    const exc = createAnimationGroupMask(["Arm"], AnimationGroupMaskMode.Exclude);
    expect(animationGroupMaskRetainsTarget(exc, "Arm")).toBe(false);
    expect(animationGroupMaskRetainsTarget(exc, "Leg")).toBe(true);
    exc.disabled = true;
    expect(animationGroupMaskRetainsTarget(exc, "Arm")).toBe(true);
    expect(animationGroupMaskRetainsTarget(createAnimationGroupMask(), "x")).toBe(false);
});
