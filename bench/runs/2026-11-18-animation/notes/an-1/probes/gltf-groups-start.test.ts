// Note: createAnimationGroups makes only the first group playing; others wait for playAnimation; unnamed clips are animation_<index>; frameRate is 60 when the clip has none.
import { expect, it } from "vitest";
import { addAnimationGroups, createAnimationGroups, createAnimationManager, playAnimation, updateAnimationManager } from "@babylonjs/lite";
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

it("first plays", () => {
    const { data, nodes } = gltf([10, 100]);
    const groups = createAnimationGroups(data);
    expect(groups.map((g) => g.name)).toEqual(["walk", "animation_1"]);
    expect(groups.map((g) => g.isPlaying)).toEqual([true, false]);
    expect(groups.map((g) => g.frameRate)).toEqual([60, 60]);
    expect(groups.map((g) => g.loopAnimation)).toEqual([true, true]);
    const manager = createAnimationManager();
    addAnimationGroups(manager, [groups[1]!]);
    updateAnimationManager(manager, 500);
    expect(groups[1]!.currentTime).toBe(0);
    expect(nodes[0]!.p).toEqual([0, 0, 0]);
    playAnimation(groups[1]!);
    updateAnimationManager(manager, 500);
    expect(groups[1]!.currentTime).toBe(0.5);
    expect(nodes[0]!.p).toEqual([50, 0, 0]);
});
