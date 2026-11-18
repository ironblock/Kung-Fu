// Note: editing mask.names in place at the same length is not picked up by glTF groups; a new array, push, or a change of mode or disabled is.
import { expect, it } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
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

it("in-place edits are missed", () => {
    const { data, nodes } = gltf([10]);
    const [group] = createAnimationGroups(data);
    const mask = createAnimationGroupMask(["hip"]);
    group!.mask = mask;
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 500);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([5, 0]);
    mask.names[0] = "arm";
    updateAnimationManager(manager, 100);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([6, 0]);
    mask.names = ["arm"];
    updateAnimationManager(manager, 100);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([0, 7]);
    mask.names.push("hip");
    updateAnimationManager(manager, 100);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([8, 8]);
    mask.names = ["arm"];
    mask.mode = AnimationGroupMaskMode.Exclude;
    updateAnimationManager(manager, 100);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([9, 0]);
    mask.disabled = true;
    updateAnimationManager(manager, 50);
    expect([nodes[0]!.p[0], nodes[1]!.p[0]]).toEqual([9.5, 9.5]);
});
