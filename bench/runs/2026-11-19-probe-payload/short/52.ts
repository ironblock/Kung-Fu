import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, setAnimationAdditive, updateAnimationManager } from "@babylonjs/lite";

const gltf = () => createAnimationGroups({
    clips: [{
        name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }],
    }],
    nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
    skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"],
    nodeTargets: [{ position: { set() {} }, rotationQuaternion: { set() {} }, scaling: { set() {} } }],
} as never)[0]!;

test("setAnimationAdditive on a detached and on an attached glTF group, managers with no engine", () => {
    expect(() => setAnimationAdditive(gltf(), { referenceFrame: 1, referenceTime: 1 })).toThrow(
        "Additive animation reference must use either referenceFrame or referenceTime, not both");
    const m1 = createAnimationManager();
    const detached = gltf();
    setAnimationAdditive(detached);
    addAnimationGroup(m1, detached);
    expect(() => updateAnimationManager(m1, 16)).not.toThrow();
    const m2 = createAnimationManager();
    const attached = gltf();
    addAnimationGroup(m2, attached);
    updateAnimationManager(m2, 16);
    setAnimationAdditive(attached);
    expect(() => updateAnimationManager(m2, 16)).toThrow("Weighted glTF animation requires an AnimationManager engine");
});
