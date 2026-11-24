import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, getAnimationGroups } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

const node = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
const target = { position: { set() {} }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
const clip = (name: string) => ({ name, duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
    samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] });

test("createAnimationGroups on three clips named \"walk\", \"\" and \"run\"", () => {
    const data = { clips: [clip("walk"), clip(""), clip("run")], nodes: [node], skeletons: [], morphBindings: [],
        nodeTargets: [target], excludedNodeIndices: new Set(), nodeNames: ["a"] } as unknown as GltfAnimationData;
    const groups = createAnimationGroups(data);
    expect(groups.map((g) => g.name)).toEqual(["walk", "animation_1", "run"]);
    expect(groups.map((g) => g.isPlaying)).toEqual([true, false, false]);
    expect(groups.map((g) => g.frameRate)).toEqual([60, 60, 60]);
    const manager = createAnimationManager();
    for (const g of groups) addAnimationGroup(manager, g);
    expect(getAnimationGroups(manager)).toEqual(groups);
});
