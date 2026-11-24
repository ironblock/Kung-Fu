import { expect, it } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, createAnimationGroupMask, createAnimationGroups, createAnimationManager, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { constClip } from "./_lib";
import { gltfData } from "./_gltf";

it("a mask matches glTF node names exactly; a masked-out node gets its rest pose written; without blending it does not change property groups", () => {
    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    g!.mask = createAnimationGroupMask(["a"], AnimationGroupMaskMode.Exclude);
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p[0]).toBeCloseTo(-5);
    g!.mask = createAnimationGroupMask(["A"], AnimationGroupMaskMode.Exclude);
    updateAnimationManager(manager, 100);
    expect(targets[0]!.p[0]).toBeCloseTo(6);

    const m2 = createAnimationManager();
    const target = { value: 0 };
    const p = createPropertyAnimationGroup(m2, target, constClip("c", 10));
    p.mask = createAnimationGroupMask(["value"], AnimationGroupMaskMode.Exclude);
    updateAnimationManager(m2, 100);
    expect(target.value).toBe(10);
    p.mask = createAnimationGroupMask([], AnimationGroupMaskMode.Include);
    target.value = 0;
    updateAnimationManager(m2, 100);
    expect(target.value).toBe(10);
});
