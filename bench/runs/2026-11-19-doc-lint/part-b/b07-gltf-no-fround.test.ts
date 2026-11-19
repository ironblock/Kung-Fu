// b-07. Lines 295-296: "Generic/glTF sampler evaluation remains unchanged."
// Reading: glTF sampler evaluation does not get the Math.fround canonicalization of b-06. So at the
// double time 0.1, a glTF STEP key stored at Math.fround(0.1) is not yet reached: the earlier key holds.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("a glTF STEP sampler at the double 0.1 holds the key before the Float32 key at 0.1", () => {
    const node = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 0.2,
                frameRate: 60,
                channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
                samplers: [{ input: new Float32Array([0, 0.1, 0.2]), output: new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0]), interpolation: 1 }],
            },
        ],
        [rest()],
        { targets: [node] }
    );
    const [group] = createAnimationGroups(data);
    goToFrame(group!, 6);
    expect(group!.currentTime).toBe(0.1);
    expect(node.p).toEqual([0, 0, 0]);
});
