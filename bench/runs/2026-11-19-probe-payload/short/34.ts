import { expect, test } from "vitest";
import { addAnimationGroup, AnimationGroupMaskMode, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

const target = () => { const n = { x: -1, position: { set: (x: number) => { n.x = x; } }, rotationQuaternion: { set() {} }, scaling: { set() {} } }; return n; };
const rest = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };

test("a glTF group masked to [\"hip\"], its mask then edited five ways; nodes hip and arm move x 0..10 over 1 s", () => {
    const hip = target(), arm = target();
    const clip = { name: "walk", duration: 1, channels: [0, 1].map((nodeIdx) => ({ samplerIdx: 0, nodeIdx, path: 0 })),
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] };
    const data = { clips: [clip], nodes: [rest, rest], skeletons: [], morphBindings: [], nodeTargets: [hip, arm], excludedNodeIndices: new Set(), nodeNames: ["hip", "arm"] };
    const [group] = createAnimationGroups(data as unknown as GltfAnimationData);
    const mask = (group!.mask = createAnimationGroupMask(["hip"]));
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    const step = (ms: number) => (updateAnimationManager(manager, ms), [hip.x, arm.x]);
    expect(step(500)).toEqual([5, 0]);
    mask.names[0] = "arm";
    expect(step(100)).toEqual([6, 0]);
    mask.names = ["arm"];
    expect(step(100)).toEqual([0, 7]);
    mask.names.push("hip");
    expect(step(100)).toEqual([8, 8]);
    mask.mode = AnimationGroupMaskMode.Exclude;
    expect(step(100)).toEqual([0, 0]);
    mask.disabled = true;
    expect(step(50)).toEqual([9.5, 9.5]);
});
