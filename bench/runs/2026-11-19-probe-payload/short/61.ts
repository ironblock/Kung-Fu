import { expect, test } from "vitest";
import { createAnimationGroups } from "@babylonjs/lite";

test("a glTF clip with five channels, paths 0 to 4, on nodes named 'hip' and unnamed", () => {
    const rest = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const hip = { position: { set() {} }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const other = { ...hip };
    const [g] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1,
            samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 1, 1, 1]), interpolation: 0 }],
            channels: [0, 1, 2, 3, 4].map((path) => ({ samplerIdx: 0, nodeIdx: path % 2, path })),
        }],
        nodes: [rest, rest], skeletons: [], morphBindings: [], excludedNodeIndices: new Set(),
        nodeNames: ["hip", undefined], nodeTargets: [hip, other],
    } as never);
    expect(g!.targetedAnimations).toEqual([
        { target: hip, targetName: "hip", nodeIndex: 0, path: "translation" },
        { target: other, targetName: undefined, nodeIndex: 1, path: "rotation" },
        { target: hip, targetName: "hip", nodeIndex: 0, path: "scale" },
        { target: other, targetName: undefined, nodeIndex: 1, path: "weights" },
        { target: hip, targetName: "hip", nodeIndex: 0, path: "pointer" },
    ]);
});
