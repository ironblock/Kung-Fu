// a-90, line 276: "isQuat: boolean, // true → uses slerp for LINEAR, normalizes for CUBICSPLINE"
// internal design: evaluateSampler is not public. Its visible effect: a glTF CUBICSPLINE rotation channel gives a unit quaternion.
// Both keys hold (0, 0, 0, 2) with zero tangents; the Hermite result is (0, 0, 0, 2), and normalized it is (0, 0, 0, 1).
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { data } from "./_fx.ts";

test("a CUBICSPLINE rotation channel is normalized", () => {
    const z = [0, 0, 0, 0];
    const key = [...z, 0, 0, 0, 2, ...z];
    const clip = {
        name: "r",
        duration: 1,
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([...key, ...key]), interpolation: 2 as const }],
        channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }],
    };
    const { data: d, targets } = data([clip], { names: ["n"] });
    const g = createAnimationGroups(d)[0]!;
    goToFrame(g, 30);
    expect(targets[0]!.r.map((v) => Math.round(v * 1e6) / 1e6)).toEqual([0, 0, 0, 1]);
});
