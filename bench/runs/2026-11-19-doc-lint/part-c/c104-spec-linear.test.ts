// c-104. Line 734: "**LINEAR interpolation**: Verify vec3 lerp and quat slerp produce correct intermediate values"
// Read as a claim that the code does this. Checked on a glTF group: translation 0 -> (10, 20, 30) at 0.25 s is
// (2.5, 5, 7.5); rotation 0 -> 120 degrees about z at 0.25 s is the slerp value, 30 degrees.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, nodeRecorder, rest, zq } from "./_fx";

test("lerp and slerp", () => {
    const node = nodeRecorder();
    const clip: ClipSpec = {
        name: "c",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 1 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 20, 30]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([...zq(0), ...zq(120)]), interpolation: 0 },
        ],
    };
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node] }));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 250);
    [2.5, 5, 7.5].forEach((v, i) => expect(node.p[i]).toBeCloseTo(v, 5));
    zq(30).forEach((v, i) => expect(node.r[i]).toBeCloseTo(v, 5));
});
