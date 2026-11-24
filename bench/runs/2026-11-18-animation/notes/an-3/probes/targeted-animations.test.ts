import { expect, it } from "vitest";
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, createTransformNode } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("property targetedAnimations hold the owner of the last path part and that part; glTF ones hold node index, name and path", () => {
    const node = createTransformNode("n");
    const clip = createPropertyAnimationClip("c", [
        { path: "position", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [1, 1, 1] }] },
        { path: "scaling.y", keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }] },
    ]);
    const g = createPropertyAnimationGroup(createAnimationManager(), node, clip);
    expect(g.targetedAnimations).toEqual([
        { target: node, path: "position" },
        { target: node.scaling, path: "y" },
    ]);

    const { data, targets } = gltfData(1);
    const [h] = createAnimationGroups(data);
    expect(h!.targetedAnimations[0]).toEqual({ target: targets[0], targetName: "a", nodeIndex: 0, path: "translation" });
});
