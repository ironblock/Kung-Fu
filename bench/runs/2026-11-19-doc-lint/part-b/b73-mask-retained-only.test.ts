// b-73. Line 537: "Mask out part of a skeleton (only the retained targets animate; the rest hold their bind pose):"
// On the fixture in _mask.ts: with an Exclude mask on the two left-leg nodes, after 0.5 s the retained
// nodes are at x = 5 and the masked ones at their rest x; the skinned bone on LeftUpLeg (masked) is at
// its rest x = 101 in the uploaded bone matrix.
import { AnimationGroupMaskMode, createAnimationGroupMask, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { names, xbotLike } from "./_mask";

test("retained targets animate; masked targets, skinned or not, hold the rest pose", () => {
    const { rig, targets, xbot, manager } = xbotLike();
    const walk = xbot.animationGroups.find((group) => group.name === "walk")!;
    walk.mask = createAnimationGroupMask(["mixamorig:LeftUpLeg", "mixamorig:LeftLeg"], AnimationGroupMaskMode.Exclude);
    playAnimation(walk);
    updateAnimationManager(manager, 500);
    names.forEach((name, i) => {
        const masked = name === "mixamorig:LeftUpLeg" || name === "mixamorig:LeftLeg";
        expect(targets[i]!.p[0]).toBe(masked ? 100 + i : 5);
    });
    expect(Math.abs(rig.skeleton.boneMatrices[12]!)).toBeCloseTo(101, 4);
});
