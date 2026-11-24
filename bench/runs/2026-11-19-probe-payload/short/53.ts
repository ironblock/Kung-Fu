import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

test("isPlaying set to true on a stopped group, an ended group and a second glTF group, then playAnimation", () => {
    const m = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const stopped = createPropertyAnimationGroup(m, { v: 0 }, clip);
    stopAnimation(stopped);
    const ended = createPropertyAnimationGroup(m, { v: 0 }, clip, { loop: false });
    updateAnimationManager(m, 2000);
    ended.currentTime = 0;
    const clips = [0, 1].map((i) => ({
        name: `c${i}`, duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }],
    }));
    const [, second] = createAnimationGroups({
        clips, nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"],
        nodeTargets: [{ position: { set() {} }, rotationQuaternion: { set() {} }, scaling: { set() {} } }],
    } as never);
    addAnimationGroup(m, second!);
    const groups = [stopped, ended, second!];
    groups.forEach((g) => (g.isPlaying = true));
    updateAnimationManager(m, 500);
    expect(groups.map((g) => g.currentTime)).toEqual([0, 0, 0]);
    groups.forEach(playAnimation);
    updateAnimationManager(m, 500);
    expect(groups.map((g) => g.currentTime)).toEqual([0.5, 0.5, 0.5]);
});
