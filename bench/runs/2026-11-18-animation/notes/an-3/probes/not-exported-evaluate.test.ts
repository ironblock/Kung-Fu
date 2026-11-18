import { expect, it } from "vitest";
import * as lite from "@babylonjs/lite";

it("several declared names are not exported from the package root", () => {
    const missing = ["evaluateSampler", "evaluatePropertySampler", "tickAnimation", "tickAnimationCore", "getAnimationGroupOwner", "ANIMATION_GROUP_TASK_CATEGORY", "_installTickAnimation", "_updateWeightedPointerAnimations"];
    for (const name of missing) {
        expect(name in lite, name).toBe(false);
    }
    for (const name of ["createAnimationGroups", "goToFrame", "setAnimationTaskCategoryHandler", "AnimationGroupMaskMode", "runFrameInterpolation", "bezierCurveEase"]) {
        expect(name in lite, name).toBe(true);
    }
});
