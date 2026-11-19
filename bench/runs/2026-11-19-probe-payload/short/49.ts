import { expect, test } from "vitest";
import { createAnimationGroups, createNullEngine, goToFrame, stopAnimation } from "@babylonjs/lite";

test("goToFrame on a looping 1 s glTF group at 60 fps, then on the same group after stopAnimation", () => {
    let x = 0;
    const node = { position: { set: (nx: number) => (x = nx) }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const [group] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
            samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }],
        }],
        nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"], nodeTargets: [node],
    } as never);
    expect(group!.loopAnimation).toBe(true);
    goToFrame(group!, 90);
    expect(group!.currentTime).toBe(0.5);
    expect(x).toBe(5);
    stopAnimation(group!);
    goToFrame(group!, 15);
    expect(group!.currentTime).toBe(0.25);
    expect(x).toBe(5);
    goToFrame(group!, 15, createNullEngine());
    expect(x).toBe(2.5);
});
