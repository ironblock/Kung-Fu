// b-04. Line 291: "CUBICSPLINE: `[inTangent0, value0, outTangent0, inTangent1, value1, outTangent1, ...]` — `stride * 3` floats per keyframe"
// Only glTF samplers can be CUBICSPLINE. Probed by handing a glTF group a CUBICSPLINE translation
// sampler laid out as the line says, and reading the poses written to the node.
// Key 0: in (100,100,100) [never used], value (1,0,0), out (2,0,0). Key 1: in (4,0,0), value (5,0,0), out (-100,..) [never used].
// Hermite at f = 0.5 with dt = 1: 0.5*1 + 0.125*2 + 0.5*5 - 0.125*4 = 2.75.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder } from "./_fx";

test("a CUBICSPLINE sampler is read as in-tangent, value, out-tangent per key", () => {
    const node = nodeRecorder();
    const output = new Float32Array([100, 100, 100, 1, 0, 0, 2, 0, 0, 4, 0, 0, 5, 0, 0, -100, -100, -100]);
    const data = gltf(
        [{ name: "c", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }], samplers: [{ input: new Float32Array([0, 1]), output, interpolation: 2 }] }],
        [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        { targets: [node] }
    );
    const [group] = createAnimationGroups(data);
    group!.loopAnimation = false;
    goToFrame(group!, 0);
    expect(node.p).toEqual([1, 0, 0]);
    goToFrame(group!, 30);
    expect(node.p[0]).toBeCloseTo(2.75, 6);
    goToFrame(group!, 60);
    expect(node.p).toEqual([5, 0, 0]);
});
