// b-75. Line 548 (code comment): "// Include mode instead lists the only targets that should animate."
import { AnimationGroupMaskMode, createAnimationGroupMask, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { names, xbotLike } from "./_mask";

test("an Include mask animates only the listed targets", () => {
    const { targets, xbot, manager } = xbotLike();
    const walk = xbot.animationGroups.find((group) => group.name === "walk")!;
    walk.mask = createAnimationGroupMask(["mixamorig:Spine", "mixamorig:LeftArm"], AnimationGroupMaskMode.Include);
    playAnimation(walk);
    updateAnimationManager(manager, 500);
    names.forEach((name, i) => {
        const listed = name === "mixamorig:Spine" || name === "mixamorig:LeftArm";
        expect(targets[i]!.p[0]).toBe(listed ? 5 : 100 + i);
    });
});
