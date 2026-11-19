// b-08. Line 300: "`evaluateSampler()` clamps `t <= input[0]` to the first key and `t >= input[last]` to the final key before searching."
// evaluateSampler is not exported. Probed through a glTF group, whose channels it evaluates:
// keys at 0.5 s (value 3) and 1.5 s (value 7); the clip runs 0 s to 2 s.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("before or at the first key a glTF channel gives the first key; at or after the last, the last", () => {
    const node = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 2,
                frameRate: 60,
                channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
                samplers: [{ input: new Float32Array([0.5, 1.5]), output: new Float32Array([3, 0, 0, 7, 0, 0]), interpolation: 0 }],
            },
        ],
        [rest()],
        { targets: [node] }
    );
    const [group] = createAnimationGroups(data);
    group!.loopAnimation = false;
    goToFrame(group!, 15);
    expect(node.p[0]).toBe(3);
    goToFrame(group!, 30);
    expect(node.p[0]).toBe(3);
    goToFrame(group!, 90);
    expect(node.p[0]).toBe(7);
    goToFrame(group!, 105);
    expect(node.p[0]).toBe(7);
    goToFrame(group!, 120);
    expect(node.p[0]).toBe(7);
});
