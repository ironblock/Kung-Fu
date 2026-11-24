// Note: goToFrame on a looping glTF group wraps the time; on a glTF group after stopAnimation, or one never played, it applies the pose only when engine is passed.
import { expect, it } from "vitest";
import { createAnimationGroups, createNullEngine, goToFrame, stopAnimation } from "@babylonjs/lite";
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

it("wraps when looping, clamps when not", () => {
    const { data, nodes } = gltf([10]);
    const [group] = createAnimationGroups(data);
    goToFrame(group!, 90);
    expect(group!.currentTime).toBe(0.5);
    expect(nodes[0]!.p).toEqual([5, 0, 0]);
    expect(group!.isPlaying).toBe(false);
    group!.loopAnimation = false;
    goToFrame(group!, 90);
    expect(group!.currentTime).toBe(1);
    expect(nodes[0]!.p).toEqual([10, 0, 0]);
});

it("needs engine on a stopped group", () => {
    const { data, nodes } = gltf([10, 100]);
    const groups = createAnimationGroups(data);
    goToFrame(groups[1]!, 30);
    expect(groups[1]!.currentTime).toBe(0.5);
    expect(nodes[0]!.p).toEqual([0, 0, 0]);
    goToFrame(groups[1]!, 30, createNullEngine());
    expect(nodes[0]!.p).toEqual([50, 0, 0]);
    stopAnimation(groups[0]!);
    goToFrame(groups[0]!, 15);
    expect(groups[0]!.currentTime).toBe(0.25);
    expect(nodes[0]!.p).toEqual([50, 0, 0]);
    goToFrame(groups[0]!, 15, createNullEngine());
    expect(nodes[0]!.p).toEqual([2.5, 0, 0]);
});
