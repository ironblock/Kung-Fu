import { createAnimationGroups, getAnimationGroups, createAnimationManager } from "@babylonjs/lite";
import { gltfData, recorder } from "./gltf-fixture.ts";

test("createAnimationGroups makes one group per clip; only the first plays; an unnamed clip is animation_<index>", () => {
    const groups = createAnimationGroups(gltfData());
    expect(groups.map((g) => g.name)).toEqual(["move", "animation_1"]);
    expect(groups.map((g) => g.isPlaying)).toEqual([true, false]);
    expect(groups.map((g) => g.loopAnimation)).toEqual([true, true]);
    expect(groups.map((g) => g.frameRate)).toEqual([60, 60]);
    expect(groups.map((g) => g.duration)).toEqual([1, 2]);
    expect(groups.map((g) => g.currentTime)).toEqual([0, 0]);
    expect(groups.map((g) => g.weight)).toEqual([1, 1]);
});

test("the groups are attached to no manager", () => {
    const groups = createAnimationGroups(gltfData());
    const manager = createAnimationManager();
    expect(getAnimationGroups(manager)).toEqual([]);
    expect(groups.length).toBe(2);
});

test("targetedAnimations lists one entry per channel with the node's target, name, index and path name", () => {
    const targets = [recorder(), recorder()];
    const [move, scale] = createAnimationGroups(gltfData(targets));
    expect(move!.targetedAnimations).toEqual([
        { target: targets[0], targetName: "root", nodeIndex: 0, path: "translation" },
        { target: targets[1], targetName: "arm", nodeIndex: 1, path: "translation" },
    ]);
    expect(scale!.targetedAnimations[0]!.path).toBe("scale");
});

test("no clips gives an empty list", () => {
    const data = { ...gltfData(), clips: [] };
    expect(createAnimationGroups(data)).toEqual([]);
});

test("a clip's frameRate becomes the group frameRate", () => {
    const groups = createAnimationGroups(gltfData(undefined, 24));
    expect(groups[0]!.frameRate).toBe(24);
});
