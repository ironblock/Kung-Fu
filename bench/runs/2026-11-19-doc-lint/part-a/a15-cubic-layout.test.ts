// a-15, line 34: "readonly output: Float32Array; // packed values; CUBICSPLINE: [inTangent, value, outTangent] per key"
// One scalar-per-component CUBICSPLINE channel (x only matters). Key 0: in 100, value 0, out 1. Key 1: in 2, value 10, out 200.
// If the layout is [in, value, out], t = 0 gives 0 (not 100), and t = 0.5 uses key 0's out (1) and key 1's in (2):
// Hermite at f = 0.5, dt = 1: 0.5*0 + 0.125*1 + 0.5*10 - 0.125*2 = 4.875.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { data } from "./_fx.ts";

test("CUBICSPLINE output is read as [inTangent, value, outTangent] per key", () => {
    const k = (i: number, v: number, o: number) => [i, 0, 0, v, 0, 0, o, 0, 0];
    const clip = {
        name: "c",
        duration: 1,
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([...k(100, 0, 1), ...k(2, 10, 200)]), interpolation: 2 as const }],
        channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
    };
    const { data: d, targets } = data([clip], { names: ["n"] });
    const [g] = createAnimationGroups(d);
    goToFrame(g!, 0);
    expect(targets[0]!.p[0]).toBe(0);
    goToFrame(g!, 30);
    expect(targets[0]!.p[0]).toBeCloseTo(4.875, 5);
});
