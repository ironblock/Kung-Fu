import { expect, test } from "vitest";
import * as lite from "@babylonjs/lite";
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";

test("constant names looked up; a hand-built clip with interpolation 2, 1, 0 on paths 0, 1, 2", () => {
    const names = ["INTERP_LINEAR", "INTERP_STEP", "INTERP_CUBICSPLINE", "PATH_TRANSLATION", "PATH_ROTATION", "PATH_SCALE"];
    expect(names.filter((n) => n in lite)).toEqual([]);
    const got: Record<string, number[]> = {};
    const rec = (k: string) => ({ set: (...v: number[]) => (got[k] = v) });
    const t = new Float32Array([0, 1]);
    const [group] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1,
            samplers: [
                { input: t, output: new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0]), interpolation: 2 },
                { input: t, output: new Float32Array([0, 0, 0, 1, 0, 1, 0, 0]), interpolation: 1 },
                { input: t, output: new Float32Array([1, 1, 1, 3, 3, 3]), interpolation: 0 },
            ],
            channels: [0, 1, 2].map((i) => ({ samplerIdx: i, nodeIdx: 0, path: i })),
        }],
        nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [], morphBindings: [], excludedNodeIndices: new Set(), nodeNames: ["n"],
        nodeTargets: [{ position: rec("position"), rotationQuaternion: rec("rotationQuaternion"), scaling: rec("scaling") }],
    } as never);
    goToFrame(group!, 15);
    expect(got).toEqual({ position: [1.5625, 0, 0], rotationQuaternion: [0, 0, 0, 1], scaling: [1.5, 1.5, 1.5] });
});
