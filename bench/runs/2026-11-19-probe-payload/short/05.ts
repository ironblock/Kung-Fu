import { expect, test } from "vitest";
import * as Lite from "@babylonjs/lite";

test("the package root, and a group's _animationManager", () => {
    const names = ["evaluateSampler", "evaluatePropertySampler", "tickAnimationCore", "tickAnimation", "getAnimationGroupOwner", "ANIMATION_GROUP_TASK_CATEGORY"];
    expect(names.filter((n) => n in Lite)).toEqual([]);
    expect(Object.keys(Lite).filter((n) => /^(INTERP_|PATH_)/.test(n))).toEqual([]);
    expect(Object.keys(Lite).filter((n) => n.startsWith("_"))).toEqual(["_getGaussianPointSplattingPackedShBytesPerSplat", "_hasGaussianPointSplattingProjectedDepth"]);
    const manager = Lite.createAnimationManager();
    const clip = Lite.createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const group = Lite.createPropertyAnimationGroup(manager, { v: 0 }, clip);
    expect(group._animationManager).toBe(manager);
});
