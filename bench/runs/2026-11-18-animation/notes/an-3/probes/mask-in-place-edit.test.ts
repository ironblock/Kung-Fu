import { expect, it } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("an in-place same-length edit of mask.names is not seen; a new names array is; disabled = true animates every node", () => {
    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    g!.mask = createAnimationGroupMask(["a"], AnimationGroupMaskMode.Exclude);
    updateAnimationManager(manager, 500);
    g!.mask.names[0] = "b";
    updateAnimationManager(manager, 100);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p[0]).toBeCloseTo(-6);
    g!.mask.names = ["b"];
    updateAnimationManager(manager, 100);
    expect(targets[0]!.p[0]).toBeCloseTo(7);
    expect(targets[1]!.p).toEqual([7, 0, 0]);
    g!.mask.disabled = true;
    updateAnimationManager(manager, 100);
    expect(targets[0]!.p[0]).toBeCloseTo(8);
    expect(targets[1]!.p[0]).toBeCloseTo(-8);
});
