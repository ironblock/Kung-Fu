// c-107. Line 737: "**Binary search edge cases**: `t` before first key, after last key, exactly on a key, between keys"
// Checked on a glTF sampler with keys at 0.5 s (0), 1 s (10), 2 s (30) in a non-looping 3 s clip: before the first key
// (0.2 s) gives 0, exactly on a key (1 s) gives 10, between keys (1.5 s) gives 20, after the last key (2.5 s) gives 30.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("key search edges", () => {
    const node = nodeRecorder();
    const clip = { name: "k", duration: 3, frameRate: 10, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 as const }], samplers: [{ input: new Float32Array([0.5, 1, 2]), output: new Float32Array([0, 0, 0, 10, 0, 0, 30, 0, 0]), interpolation: 0 as const }] };
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node] }));
    g!.loopAnimation = false;
    const at = (frame: number) => {
        goToFrame(g!, frame);
        return node.p[0];
    };
    expect(at(2)).toBe(0);
    expect(at(10)).toBe(10);
    expect(at(15)).toBeCloseTo(20, 5);
    expect(at(25)).toBe(30);
});
