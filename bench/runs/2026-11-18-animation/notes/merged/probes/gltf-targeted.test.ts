// Note: a glTF group's targetedAnimations has one entry per channel: nodeIndex, targetName from nodeNames, target from nodeTargets, and a path name.
import { expect, it } from "vitest";
import { createAnimationGroups } from "@babylonjs/lite";
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

it("targetedAnimations has one entry per channel", () => {
    const { data, nodes } = gltf([10], ["hip", undefined]);
    const [group] = createAnimationGroups(data);
    expect(group!.targetedAnimations).toEqual([
        { target: nodes[0], targetName: "hip", nodeIndex: 0, path: "translation" },
        { target: nodes[1], targetName: undefined, nodeIndex: 1, path: "translation" },
    ]);
    const paths = ([0, 1, 2, 3, 4] as const).map((path) => createAnimationGroups({ ...data, clips: [{ ...data.clips[0]!, channels: [{ samplerIdx: 0, nodeIdx: 0, path }] }] })[0]!.targetedAnimations[0]!.path);
    expect(paths).toEqual(["translation", "rotation", "scale", "weights", "pointer"]);
});
