// b-17. Lines 322-323: "The generic glTF sampler retains its existing glTF quaternion interpolation path."
// Reading: glTF rotation channels do not take the property path of b-16. On the same near-parallel
// non-unit keys (0,0,0,2) and (0,0,0,4), the glTF path blends and then normalizes, giving (0,0,0,1),
// where the property path gives (0,0,0,3).
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("a glTF rotation channel normalizes a near-parallel blend", () => {
    const node = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 1,
                frameRate: 2,
                channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }],
                samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 2, 0, 0, 0, 4]), interpolation: 0 }],
            },
        ],
        [rest()],
        { targets: [node] }
    );
    const [group] = createAnimationGroups(data);
    goToFrame(group!, 1);
    expect(node.r).toEqual([0, 0, 0, 1]);
});
