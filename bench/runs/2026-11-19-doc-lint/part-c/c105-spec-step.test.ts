// c-105. Line 735: "**STEP interpolation**: Verify output snaps to keyframe value without blending"
// Checked on a glTF STEP sampler (keys 0 at 0 s, 10 at 1 s, 20 at 2 s): at 0.9 s the value is 0, at 1.5 s it is 10.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("step holds the key value", () => {
    const node = nodeRecorder();
    const clip = { name: "s", duration: 2, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 as const }], samplers: [{ input: new Float32Array([0, 1, 2]), output: new Float32Array([0, 0, 0, 10, 0, 0, 20, 0, 0]), interpolation: 1 as const }] };
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node] }));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 900);
    expect(node.p[0]).toBe(0);
    updateAnimationManager(manager, 600);
    expect(node.p[0]).toBe(10);
});
