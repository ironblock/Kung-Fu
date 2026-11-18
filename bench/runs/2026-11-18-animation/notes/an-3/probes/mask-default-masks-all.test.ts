import { expect, it } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, animationGroupMaskRetainsTarget, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("createAnimationGroupMask() is Include with no names and masks out every node", () => {
    const mask = createAnimationGroupMask();
    expect(mask).toEqual({ mode: AnimationGroupMaskMode.Include, names: [], disabled: false });
    expect(animationGroupMaskRetainsTarget(mask, "a")).toBe(false);
    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    g!.mask = mask;
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p).toEqual([7, 0, 0]);
});
