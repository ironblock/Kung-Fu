// Note: masks match glTF node names exactly (case-sensitive); Include is the default mode; a masked-out node with a scene target is set to its rest pose each tick.
import { expect, it } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, animationGroupMaskRetainsTarget, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
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

it("include by exact name", () => {
    const mask = createAnimationGroupMask(["hip"]);
    expect(mask.mode).toBe(AnimationGroupMaskMode.Include);
    expect(animationGroupMaskRetainsTarget(mask, "hip")).toBe(true);
    expect(animationGroupMaskRetainsTarget(mask, "Hip")).toBe(false);
    const { data, nodes } = gltf([10]);
    // The arm's rest pose is x = 3.
    (data.nodes as ReturnType<typeof rest>[])[1] = { ...rest(), tx: 3 };
    const [group] = createAnimationGroups(data);
    group!.mask = mask;
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    nodes[1]!.p = [9, 9, 9];
    updateAnimationManager(manager, 500);
    expect(nodes[0]!.p).toEqual([5, 0, 0]);
    expect(nodes[1]!.p).toEqual([3, 0, 0]);
    nodes[1]!.p = [9, 9, 9];
    updateAnimationManager(manager, 100);
    expect(nodes[1]!.p).toEqual([3, 0, 0]);
    group!.mask = createAnimationGroupMask(["Hip"]);
    updateAnimationManager(manager, 100);
    expect(nodes[0]!.p).toEqual([0, 0, 0]);
});
