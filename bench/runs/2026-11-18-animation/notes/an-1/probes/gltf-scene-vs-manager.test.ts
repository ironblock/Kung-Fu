// Note: glTF groups put in a scene with addToScene are advanced by the scene each frame until addAnimationGroup gives them to a manager; after removeAnimationGroup the scene advances them again.
import { expect, it } from "vitest";
import { addAnimationGroup, addToScene, createAnimationGroups, createAnimationManager, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationClip, AssetContainer, GltfAnimationData } from "@babylonjs/lite";
import { makeScene, tick } from "../helpers.js";
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

it("scene drives until a manager owns", () => {
    const { data, nodes } = gltf([10]);
    const groups = createAnimationGroups(data);
    const scene = makeScene();
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    expect(scene.animationGroups).toEqual(groups);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
    expect(nodes[0]!.p).toEqual([2.5, 0, 0]);
    const manager = createAnimationManager();
    addAnimationGroup(manager, groups[0]!);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
    removeAnimationGroup(manager, groups[0]!);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.5);
});
