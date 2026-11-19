// b-02. Line 288: "**NodeRest**: 10 fields per node (tx,ty,tz, rx,ry,rz,rw, sx,sy,sz) stored in `GltfAnimationData.nodes[]`"
// NodeRest is not exported; GltfAnimationData is. Probed through its user-visible effect: the rest
// pose a glTF group writes for a node comes from those ten fields of GltfAnimationData.nodes[i].
// The node's channels are masked out so only the rest pose is written.
import { addAnimationGroup, AnimationGroupMaskMode, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltf, nodeRecorder } from "./_fx";

test("the rest pose written for a node is its tx..sz fields in GltfAnimationData.nodes[]", () => {
    const node = nodeRecorder();
    const restNode = { parentIdx: -1, tx: 1, ty: 2, tz: 3, rx: 0, ry: 0, rz: 0.6, rw: 0.8, sx: 2, sy: 3, sz: 4 };
    const data = gltf(
        [
            {
                name: "all",
                duration: 1,
                channels: [
                    { samplerIdx: 0, nodeIdx: 0, path: 0 },
                    { samplerIdx: 1, nodeIdx: 0, path: 1 },
                    { samplerIdx: 0, nodeIdx: 0, path: 2 },
                ],
                samplers: [
                    { input: new Float32Array([0, 1]), output: new Float32Array([9, 9, 9, 9, 9, 9]), interpolation: 0 },
                    { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]), interpolation: 0 },
                ],
            },
        ],
        [restNode],
        { targets: [node], names: ["n0"] }
    );
    const [group] = createAnimationGroups(data);
    group!.mask = createAnimationGroupMask(["n0"], AnimationGroupMaskMode.Exclude);
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 500);
    expect(node.p).toEqual([1, 2, 3]);
    expect(node.r[2]).toBeCloseTo(0.6, 6);
    expect(node.r[3]).toBeCloseTo(0.8, 6);
    expect(node.s).toEqual([2, 3, 4]);
});
