// Note: a glTF group with loopAnimation false clamps currentTime at the clip end but keeps isPlaying true.
import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
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

it("no end state", () => {
    const { data, nodes } = gltf([10]);
    const [group] = createAnimationGroups(data);
    group!.loopAnimation = false;
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 1500);
    expect(group!.currentTime).toBe(1);
    expect(nodes[0]!.p).toEqual([10, 0, 0]);
    expect(group!.isPlaying).toBe(true);
    updateAnimationManager(manager, 500);
    expect(group!.currentTime).toBe(1);
    expect(group!.isPlaying).toBe(true);
});
