// b-22. Lines 333-335: "The evaluators share keyframe search and quaternion math, while the property evaluator factors its own packed-value copying and LINEAR interpolation path."
// Internal design. Reading most favourable to the sentence: for the same keys at the same time, the
// glTF and property evaluators pick the same segment and, for unit quaternions far from parallel, give
// the same rotation. (Near-parallel keys differ on purpose: see b-16 and b-17.)
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";
import { gltf, nodeRecorder, rest } from "./_fx";

test("same keys, same time: same segment and same wide-angle slerp on both paths", () => {
    const s = Math.SQRT1_2;
    const times = [0, 1, 2, 3];
    const xs = [0, 10, 30, 60];
    const quats = [[0, 0, 0, 1], [0, 0, s, s], [0, 0, 1, 0], [0, 0, s, -s]];
    const node = nodeRecorder();
    const data = gltf(
        [
            {
                name: "c",
                duration: 3,
                frameRate: 4,
                channels: [
                    { samplerIdx: 0, nodeIdx: 0, path: 0 },
                    { samplerIdx: 1, nodeIdx: 0, path: 1 },
                ],
                samplers: [
                    { input: new Float32Array(times), output: new Float32Array(xs.flatMap((v) => [v, 0, 0])), interpolation: 0 },
                    { input: new Float32Array(times), output: new Float32Array(quats.flat()), interpolation: 0 },
                ],
            },
        ],
        [rest()],
        { targets: [node] }
    );
    const [g] = createAnimationGroups(data);
    const target = { x: 0, rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } };
    const clip = createPropertyAnimationClip(
        "c",
        [
            { path: "x", keys: times.map((time, i) => ({ time, value: xs[i]! })) },
            { path: "rotationQuaternion", keys: times.map((time, i) => ({ time, value: quats[i]! })) },
        ],
        { frameRate: 4 }
    );
    const p = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    for (const frame of [1, 3, 5, 6, 9, 11]) {
        goToFrame(g!, frame);
        goToFrame(p, frame);
        expect(target.x).toBeCloseTo(node.p[0]!, 5);
        const q = target.rotationQuaternion;
        [q.x, q.y, q.z, q.w].forEach((v, i) => expect(v).toBeCloseTo(node.r[i]!, 5));
    }
});
