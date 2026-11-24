// Note: names in the declarations that @babylonjs/lite does not export.
import { expect, it } from "vitest";
import * as Lite from "@babylonjs/lite";

it("these names are missing from the package root", () => {
    const missing = ["evaluateSampler", "evaluatePropertySampler", "tickAnimationCore", "tickAnimation", "getAnimationGroupOwner", "ANIMATION_GROUP_TASK_CATEGORY", "INTERP_LINEAR", "INTERP_STEP", "INTERP_CUBICSPLINE", "PATH_TRANSLATION", "PATH_ROTATION", "PATH_SCALE", "PATH_WEIGHTS", "PATH_POINTER", "_installTickAnimation", "_setTickAnimationImpl", "_installPropertyMixerHandler", "_updateWeightedPointerAnimations", "_writeUncontestedPointerTracks", "_finishWeightedPointerAnimations"];
    for (const name of missing) {
        expect(name in Lite, name).toBe(false);
    }
    expect("getAnimationGroups" in Lite).toBe(true);
    expect("AnimationGroupMaskMode" in Lite).toBe(true);
});

it("group._animationManager holds the owning manager", () => {
    const manager = Lite.createAnimationManager();
    const group = Lite.createPropertyAnimationGroup(manager, { v: 0 }, Lite.createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    expect(group._animationManager).toBe(manager);
    Lite.removeAnimationGroup(manager, group);
    expect(group._animationManager).toBeUndefined();
});
