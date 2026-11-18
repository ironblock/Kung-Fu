import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip } from "./_lib";
import { gltfData } from "./_gltf";

it("weight has no effect when the manager has no blending enabled", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const group = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(10);
    setAnimationWeight(group, 0);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(10);

    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const m = createAnimationManager();
    addAnimationGroup(m, g!);
    setAnimationWeight(g!, 0.5);
    updateAnimationManager(m, 250);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5);
});
