// Note: pauseAnimation stops advancing and writing; stopAnimation also puts currentTime at the range start and writes nothing, so the target keeps its last value.
import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

it("property group", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 300);
    pauseAnimation(group);
    target.v = 50;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(50);
    expect(group.currentTime).toBeCloseTo(0.3);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(target.v).toBeCloseTo(4);
    stopAnimation(group);
    expect(group.isPlaying).toBe(false);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBeCloseTo(4);
    updateAnimationManager(manager, 100);
    expect(target.v).toBeCloseTo(4);
    expect(group.currentTime).toBe(0);
});

it("glTF group keeps its pose on stop", () => {
    const pos = { p: [0, 0, 0] };
    const target = { position: { set: (x: number, y: number, z: number) => (pos.p = [x, y, z]) }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const data: GltfAnimationData = {
        clips: [{ name: "a", duration: 1, samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }] }],
        nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], nodeTargets: [target], excludedNodeIndices: new Set(), nodeNames: ["n"],
    };
    const [group] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 400);
    stopAnimation(group!);
    updateAnimationManager(manager, 100);
    expect(group!.currentTime).toBe(0);
    expect(pos.p).toEqual([4, 0, 0]);
});
