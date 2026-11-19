import { expect, test } from "vitest";
import { AnimationGroupMaskMode, addAnimationGroup, animationGroupMaskRetainsTarget, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";

test("createAnimationGroupMask() with no arguments, set on a glTF group, one update", () => {
    const mask = createAnimationGroupMask();
    expect(mask).toEqual({ mode: AnimationGroupMaskMode.Include, names: [], disabled: false });
    expect(animationGroupMaskRetainsTarget(mask, "n")).toBe(false);
    let x = -1;
    const [g] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
            samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }],
        }],
        nodes: [{ parentIdx: -1, tx: 3, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"],
        nodeTargets: [{ position: { set: (nx: number) => (x = nx) }, rotationQuaternion: { set() {} }, scaling: { set() {} } }],
    } as never);
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    g!.mask = mask;
    updateAnimationManager(manager, 500);
    expect(x).toBe(3);
});
