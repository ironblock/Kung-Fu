// Note: under enableAnimationBlending, a glTF group with weight other than 1 needs a manager created with engine or updateAnimationManager throws; such groups do not write scene node targets.
import { expect, it } from "vitest";
import { addAnimationGroups, createAnimationGroups, createAnimationManager, createNullEngine, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationClip, GltfAnimationData } from "@babylonjs/lite";
const rest = () => ({ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 });
function node() {
    const n = { p: [0, 0, 0], position: { set: (x: number, y: number, z: number) => { n.p = [x, y, z]; } }, rotationQuaternion: { set: () => {} }, scaling: { set: () => {} } };
    return n;
}
// One clip per entry; clip i moves every node along x from 0 to ends[i] over 1 s.
function gltf(ends: number[], names: (string | undefined)[] = ["hip", "arm"]) {
    const nodes = names.map(() => node());
    const clips: AnimationClip[] = ends.map((end, i) => ({
        name: i === 0 ? "walk" : "",
        duration: 1,
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, end, 0, 0]), interpolation: 0 }],
        channels: names.map((_, nodeIdx) => ({ samplerIdx: 0, nodeIdx, path: 0 })),
    }));
    const data: GltfAnimationData = { clips, nodes: names.map(rest), skeletons: [], morphBindings: [], nodeTargets: nodes, excludedNodeIndices: new Set(), nodeNames: names };
    return { data, nodes };
}

it("weight 1 still writes nodes", () => {
    const { data, nodes } = gltf([10]);
    const manager = createAnimationManager();
    enableAnimationBlending(manager);
    addAnimationGroups(manager, createAnimationGroups(data));
    updateAnimationManager(manager, 500);
    expect(nodes[0]!.p).toEqual([5, 0, 0]);
});

it("throws without engine", () => {
    const { data } = gltf([10]);
    const manager = createAnimationManager();
    enableAnimationBlending(manager);
    const groups = createAnimationGroups(data);
    addAnimationGroups(manager, groups);
    setAnimationWeight(groups[0]!, 0.5);
    expect(() => updateAnimationManager(manager, 100)).toThrow(/requires an AnimationManager engine/);
});

it("does not write node targets", () => {
    const { data, nodes } = gltf([10]);
    const manager = createAnimationManager({ engine: createNullEngine() });
    enableAnimationBlending(manager);
    const groups = createAnimationGroups(data);
    addAnimationGroups(manager, groups);
    setAnimationWeight(groups[0]!, 0.5);
    nodes[0]!.p = [7, 7, 7];
    updateAnimationManager(manager, 500);
    expect(groups[0]!.currentTime).toBe(0.5);
    expect(nodes[0]!.p).toEqual([7, 7, 7]);
});
