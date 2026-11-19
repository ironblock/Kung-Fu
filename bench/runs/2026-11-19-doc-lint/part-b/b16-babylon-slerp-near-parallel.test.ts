// b-16. Lines 321-322: "Property quaternion interpolation follows Babylon.js `Quaternion.SlerpToRef` near-parallel behavior."
// Reference below: the near-parallel branch of Babylon.js Quaternion.SlerpToRef, written out
// (|dot| > 0.999999: weights 1 - t and +/- t, no normalization). Non-unit keys make the
// missing normalization visible; it is part of that behaviour.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

function babylonSlerp(a: number[], b: number[], t: number): number[] {
    let dot = a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]! + a[3]! * b[3]!;
    let flip = false;
    if (dot < 0) {
        flip = true;
        dot = -dot;
    }
    let w0: number;
    let w1: number;
    if (dot > 0.999999) {
        w0 = 1 - t;
        w1 = flip ? -t : t;
    } else {
        const angle = Math.acos(dot);
        const inv = 1 / Math.sin(angle);
        w0 = Math.sin((1 - t) * angle) * inv;
        w1 = flip ? -Math.sin(t * angle) * inv : Math.sin(t * angle) * inv;
    }
    return [0, 1, 2, 3].map((i) => w0 * a[i]! + w1 * b[i]!);
}

function sample(a: number[], b: number[]): number[] {
    const target = { rotationQuaternion: { x: 9, y: 9, z: 9, w: 9 } };
    const clip = createPropertyAnimationClip("c", [{ path: "rotationQuaternion", keys: [{ time: 0, value: a }, { time: 1, value: b }] }], { frameRate: 2 });
    goToFrame(createPropertyAnimationGroup(createAnimationManager(), target, clip), 1);
    const q = target.rotationQuaternion;
    return [q.x, q.y, q.z, q.w];
}

test("near-parallel keys are mixed with weights 1 - t and t, sign-corrected, and not normalized", () => {
    for (const [a, b] of [
        [[0, 0, 0, 2], [0, 0, 0, 4]],
        [[0, 0, 0, 1], [0, 0, 0, -3]],
        [[0, 0, 0, 1], [0, 0, Math.sin(0.001), Math.cos(0.001)]],
    ] as number[][][]) {
        const got = sample(a!, b!);
        const want = babylonSlerp(a!, b!, 0.5);
        for (let i = 0; i < 4; i++) {
            expect(got[i]).toBeCloseTo(want[i]!, 6);
        }
    }
});
