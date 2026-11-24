// Which names of src/animation can be imported from "@babylonjs/lite".
import * as lite from "@babylonjs/lite";

const has = (name: string): boolean => name in lite;

test("these value names are not exported", () => {
    for (const name of [
        "evaluateSampler",
        "evaluatePropertySampler",
        "tickAnimation",
        "tickAnimationCore",
        "getAnimationGroupOwner",
        "ANIMATION_GROUP_TASK_CATEGORY",
        "INTERP_LINEAR",
        "INTERP_STEP",
        "INTERP_CUBICSPLINE",
        "PATH_TRANSLATION",
        "PATH_ROTATION",
        "PATH_SCALE",
        "PATH_WEIGHTS",
        "PATH_POINTER",
        "_installTickAnimation",
        "_setTickAnimationImpl",
        "_installPropertyMixerHandler",
        "_updateWeightedPointerAnimations",
        "_writeUncontestedPointerTracks",
        "_finishWeightedPointerAnimations",
    ]) {
        expect(has(name), name).toBe(false);
    }
});

test("these value names are exported", () => {
    for (const name of [
        "createAnimationManager",
        "updateAnimationManager",
        "startAnimationManager",
        "stopAnimationManager",
        "clearAnimationManager",
        "createAnimationTask",
        "addAnimationTask",
        "removeAnimationTask",
        "setAnimationTaskCategoryHandler",
        "addAnimationGroup",
        "addAnimationGroups",
        "removeAnimationGroup",
        "getAnimationGroups",
        "createAnimationGroups",
        "playAnimation",
        "pauseAnimation",
        "stopAnimation",
        "goToFrame",
        "createPropertyAnimationClip",
        "createPropertyAnimationGroup",
        "setAnimationWeight",
        "fadeAnimationWeight",
        "crossFadeAnimationGroups",
        "enablePropertyAnimationBlending",
        "enableAnimationBlending",
        "setAnimationAdditive",
        "AnimationGroupMaskMode",
        "createAnimationGroupMask",
        "animationGroupMaskRetainsTarget",
        "runFrameInterpolation",
        "quadraticEase",
        "bezierCurveEase",
        "createBezierCurveEase",
        "createBounceEase",
    ]) {
        expect(has(name), name).toBe(true);
    }
});
