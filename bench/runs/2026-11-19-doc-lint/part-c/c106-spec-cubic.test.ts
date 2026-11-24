// c-106. Line 736: "**CUBICSPLINE interpolation**: Verify Hermite spline evaluation with tangents; verify quaternion
// normalization"
// Checked on glTF CUBICSPLINE samplers (output per key: in-tangent, value, out-tangent). Translation x: p0 = 0 with
// out-tangent 2, p1 = 1 with in-tangent 0, keys 1 s apart. At s = 0.5 the Hermite value is
// h00*p0 + h10*m0 + h01*p1 + h11*m1 = 0 + 0.125*2 + 0.5*1 + 0 = 0.75. Rotation: keys whose values are not unit
// quaternions give a unit quaternion at 0.5 s.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, nodeRecorder, rest } from "./_fx";

test("hermite and normalized quaternion", () => {
    const node = nodeRecorder();
    const clip: ClipSpec = {
        name: "c",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 1 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]), interpolation: 2 },
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0]), interpolation: 2 },
        ],
    };
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node] }));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 500);
    expect(node.p[0]).toBeCloseTo(0.75, 5);
    expect(Math.hypot(...node.r)).toBeCloseTo(1, 5);
});
