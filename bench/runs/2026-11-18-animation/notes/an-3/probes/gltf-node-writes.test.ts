import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("a glTF group writes a node through position/rotationQuaternion/scaling.set, only for paths its clip animates; excluded nodes are never written", () => {
    const { data, targets } = gltfData(1);
    const excluded = { ...data, excludedNodeIndices: new Set([1]) } as GltfAnimationData;
    const [g] = createAnimationGroups(excluded);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    let rotationWrites = 0;
    targets[0]!.rotationQuaternion.set = () => rotationWrites++;
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p[0]).toBeCloseTo(5);
    expect(rotationWrites).toBe(0);
    expect(targets[0]!.s).toEqual([1, 1, 1]);
    expect(targets[0]!.writes).toBe(1);
    expect(targets[1]!.writes).toBe(0);
});
