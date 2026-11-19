// a-89, line 276: "isQuat: boolean, // true → uses slerp for LINEAR, normalizes for CUBICSPLINE"
// internal design: evaluateSampler is not public. Its visible effect: a glTF rotation channel (which the controller samples as a quaternion)
// slerps under LINEAR. Identity to 90 degrees about z, at a quarter: slerp gives z = sin(11.25 deg) = 0.19509;
// a normalized lerp would give 0.18738.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { data } from "./_fx.ts";

test("a LINEAR rotation channel slerps", () => {
    const s = Math.SQRT1_2;
    const clip = {
        name: "r",
        duration: 1,
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 1, 0, 0, s, s]), interpolation: 0 as const }],
        channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }],
    };
    const { data: d, targets } = data([clip], { names: ["n"] });
    const g = createAnimationGroups(d)[0]!;
    goToFrame(g, 15);
    const a = (11.25 * Math.PI) / 180;
    expect(targets[0]!.r[2]).toBeCloseTo(Math.sin(a), 5);
    expect(targets[0]!.r[3]).toBeCloseTo(Math.cos(a), 5);
});
