import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("createAnimationGroups gives one group per clip; only the first plays; an unnamed clip is animation_<index>", () => {
    const { data, targets } = gltfData(3);
    const groups = createAnimationGroups(data);
    expect(groups.map((g) => g.name)).toEqual(["clip0", "animation_1", "clip2"]);
    expect(groups.map((g) => g.isPlaying)).toEqual([true, false, false]);
    expect(groups.map((g) => g.frameRate)).toEqual([60, 60, 60]);
    expect(targets[0]!.writes).toBe(0);

    const manager = createAnimationManager();
    addAnimationGroup(manager, groups[1]!);
    updateAnimationManager(manager, 250);
    expect(groups[1]!.currentTime).toBe(0);
    expect(targets[0]!.writes).toBe(0);
    playAnimation(groups[1]!);
    updateAnimationManager(manager, 250);
    expect(groups[1]!.currentTime).toBe(0.25);
    expect(targets[0]!.p[0]).toBeCloseTo(5);
});
