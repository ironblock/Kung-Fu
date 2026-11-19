// b-21. Lines 331-333: "glTF LINEAR, STEP, and CUBICSPLINE samplers continue through `evaluateSampler()` unchanged, so caller-authored easing cannot silently alter imported asset semantics."
// Reading: glTF groups have no easing hook. Even an `easing` function slipped onto a glTF sampler
// object is not called, and LINEAR stays linear, STEP stays held.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("glTF samplers ignore an easing function and interpolate as authored", () => {
    let calls = 0;
    const easing = () => {
        calls++;
        return 0.9;
    };
    const lin = nodeRecorder();
    const step = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 1,
                frameRate: 4,
                channels: [
                    { samplerIdx: 0, nodeIdx: 0, path: 0 },
                    { samplerIdx: 1, nodeIdx: 1, path: 0 },
                ],
                samplers: [
                    { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 8, 0, 0]), interpolation: 0, easing } as never,
                    { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 8, 0, 0]), interpolation: 1, easing } as never,
                ],
            },
        ],
        [rest(), rest()],
        { targets: [lin, step] }
    );
    const [group] = createAnimationGroups(data);
    goToFrame(group!, 1); // 0.25 s
    expect(lin.p[0]).toBe(2);
    expect(step.p[0]).toBe(0);
    expect(calls).toBe(0);
});
