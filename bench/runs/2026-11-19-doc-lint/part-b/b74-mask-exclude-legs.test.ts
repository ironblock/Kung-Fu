// b-74. Line 542 (code comment): "// Exclude the legs → the hips, spine, and arms walk while the legs stay at bind pose."
// The example's own mask and calls, on the fixture in _mask.ts. After 0.5 s hips, spine and arm are at
// x = 5; the six leg nodes are at their rest x.
import { AnimationGroupMaskMode, createAnimationGroupMask, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { names, xbotLike } from "./_mask";

test("excluding the six leg names: upper body walks, legs stay at rest", () => {
    const { targets, xbot, manager } = xbotLike();
    const walk = xbot.animationGroups!.find((group) => group.name === "walk")!;
    walk.mask = createAnimationGroupMask(
        ["mixamorig:LeftUpLeg", "mixamorig:LeftLeg", "mixamorig:LeftFoot", "mixamorig:RightUpLeg", "mixamorig:RightLeg", "mixamorig:RightFoot"],
        AnimationGroupMaskMode.Exclude
    );
    playAnimation(walk);
    updateAnimationManager(manager, 500);
    names.forEach((name, i) => {
        const leg = /Leg|Foot/.test(name);
        expect(targets[i]!.p[0]).toBe(leg ? 100 + i : 5);
    });
});
