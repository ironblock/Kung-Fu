// a-08, line 7: "Evaluation runs LINEAR, STEP, and CUBICSPLINE interpolation using pre-allocated scratch buffers, with no per-frame heap allocation."
// This probe takes the three modes only. The allocation half is a performance claim and is not probed.
// Three nodes, one channel each, value 0 -> 10 over 1 s; CUBICSPLINE has zero tangents. Sampled at 0.25 s.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, rest } from "./_fx.ts";

test("LINEAR, STEP and CUBICSPLINE samplers each give their own curve", () => {
    const input = new Float32Array([0, 1]);
    const clip = {
        name: "c",
        duration: 1,
        samplers: [
            { input, output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 as const },
            { input, output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 1 as const },
            { input, output: new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0]), interpolation: 2 as const },
        ],
        channels: [0, 1, 2].map((i) => ({ samplerIdx: i, nodeIdx: i, path: 0 })),
    };
    const { data: d, targets } = data([clip], { names: ["l", "s", "c"], nodes: [rest(), rest(), rest()] });
    const manager = createAnimationManager();
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    updateAnimationManager(manager, 250);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5, 5);
    expect(targets[1]!.p[0]).toBe(0);
    // Hermite with zero tangents at f = 0.25: (-2f^3 + 3f^2) * 10 = 1.5625
    expect(targets[2]!.p[0]).toBeCloseTo(1.5625, 5);
});
