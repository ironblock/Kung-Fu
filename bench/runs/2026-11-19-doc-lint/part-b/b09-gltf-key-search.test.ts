// b-09. Line 300: "For interior samples, `findKeyframe(input, t)` performs binary search to find index `i` such that `input[i] <= t < input[i+1]`."
// findKeyframe is internal. Probed through glTF groups: an interior time uses the segment
// [input[i], input[i+1]) that holds it; at a key's exact time the segment that key starts is used.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

function group(interpolation: 0 | 1) {
    const node = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 4,
                frameRate: 4,
                channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
                samplers: [{ input: new Float32Array([0, 1, 2, 3, 4]), output: new Float32Array([0, 0, 0, 10, 0, 0, 30, 0, 0, 60, 0, 0, 100, 0, 0]), interpolation }],
            },
        ],
        [rest()],
        { targets: [node] }
    );
    const [g] = createAnimationGroups(data);
    return { g: g!, node };
}

test("interior samples use the segment input[i] <= t < input[i+1]", () => {
    const lin = group(0);
    goToFrame(lin.g, 10); // 2.5 s
    expect(lin.node.p[0]).toBe(45);
    goToFrame(lin.g, 3); // 0.75 s
    expect(lin.node.p[0]).toBe(7.5);
    const step = group(1);
    goToFrame(step.g, 8); // 2 s, exactly key 2
    expect(step.node.p[0]).toBe(30);
    goToFrame(step.g, 11); // 2.75 s
    expect(step.node.p[0]).toBe(30);
    goToFrame(step.g, 12); // 3 s, exactly key 3
    expect(step.node.p[0]).toBe(60);
});
