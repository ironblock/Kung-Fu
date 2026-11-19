import { expect, test } from "vitest";
import { addAnimationGroup, animationGroupMaskRetainsTarget, AnimationGroupMaskMode, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

const target = () => { const n = { x: -1, position: { set: (x: number) => { n.x = x; } }, rotationQuaternion: { set() {} }, scaling: { set() {} } }; return n; };
const rest = (tx: number) => ({ parentIdx: -1, tx, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 });

test("mask [\"hip\"] on a clip moving nodes \"hip\" (rest x 0) and \"arm\" (rest x 3) from x 0 to 10 over 1 s", () => {
    const mask = createAnimationGroupMask(["hip"]);
    expect(mask.mode).toBe(AnimationGroupMaskMode.Include);
    expect(animationGroupMaskRetainsTarget(mask, "Hip")).toBe(false);
    const hip = target(), arm = target();
    const clip = { name: "walk", duration: 1, channels: [0, 1].map((nodeIdx) => ({ samplerIdx: 0, nodeIdx, path: 0 })),
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] };
    const data = { clips: [clip], nodes: [rest(0), rest(3)], skeletons: [], morphBindings: [], nodeTargets: [hip, arm], excludedNodeIndices: new Set(), nodeNames: ["hip", "arm"] };
    const [group] = createAnimationGroups(data as unknown as GltfAnimationData);
    group!.mask = mask;
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 500);
    expect([hip.x, arm.x]).toEqual([5, 3]);
    arm.x = 99;
    updateAnimationManager(manager, 100);
    expect([hip.x, arm.x]).toEqual([6, 3]);
    group!.mask = createAnimationGroupMask(["Hip"]);
    updateAnimationManager(manager, 100);
    expect([hip.x, arm.x]).toEqual([0, 3]);
});
