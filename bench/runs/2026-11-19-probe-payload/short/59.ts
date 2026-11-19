import { expect, test } from "vitest";
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("goToFrame 90 on a 1 s glTF group, looping then not; goToFrame on a property group with fromTime 0.4 and toTime 0.6", () => {
    const [g] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
            samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }],
        }],
        nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"],
        nodeTargets: [{ position: { set() {} }, rotationQuaternion: { set() {} }, scaling: { set() {} } }],
    } as never);
    goToFrame(g!, 90);
    expect(g!.currentTime).toBe(0.5);
    g!.loopAnimation = false;
    goToFrame(g!, 90);
    expect(g!.currentTime).toBe(1);

    const clip = createPropertyAnimationClip("p", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const target = { v: -1 };
    const p = createPropertyAnimationGroup(createAnimationManager(), target, clip, { fromTime: 0.4, toTime: 0.6 });
    goToFrame(p, 6);
    expect([p.currentTime, target.v]).toEqual([0.1, 1]);
    goToFrame(p, 90);
    expect([p.currentTime, target.v]).toEqual([1, 10]);
    goToFrame(p, -6);
    expect(p.currentTime).toBe(0);
});
