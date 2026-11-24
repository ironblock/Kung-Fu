// c-31. Line 586: "rotation uses weighted quaternion accumulation with hemisphere correction and final normalization"
// Checked with enableAnimationBlending, total weight 1 (the plain case, so the weights sum needs no fill):
// 1. hemisphere: weights 0.5/0.5 on 0 degrees and on the negated quaternion of 90 degrees give 45 degrees;
// 2. accumulation: weights 0.25/0.75 on 0 and 90 degrees about z. Accumulating w*q and normalizing gives
//    normalize(0.25*q0 + 0.75*q90), an angle of 2*atan2(0.75*sin45, 0.25 + 0.75*cos45) = 68.40 degrees.
//    (A slerp by 0.75 would give 67.5 degrees.)
import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, recordingEngine, rest, rootPose, skeleton, zq } from "./_fx";

function holdQ(name: string, q: number[]): ClipSpec {
    return { name, duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }], samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([...q, ...q]), interpolation: 0 }] };
}

function blend(q1: number[], w1: number, q2: number[], w2: number): number {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const groups = createAnimationGroups(gltf([holdQ("a", q1), holdQ("b", q2)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    playAnimation(groups[1]!);
    setAnimationWeight(groups[0]!, w1);
    setAnimationWeight(groups[1]!, w2);
    updateAnimationManager(manager, 100);
    return rootPose(skel.boneMatrices).zDeg;
}

test("hemisphere correction", () => {
    expect(blend(zq(0), 0.5, zq(90).map((c) => -c), 0.5)).toBeCloseTo(45, 2);
});

test("weighted accumulation then normalization", () => {
    const s = Math.SQRT1_2;
    const expected = (2 * Math.atan2(0.75 * s, 0.25 + 0.75 * s) * 180) / Math.PI;
    expect(expected).toBeCloseTo(68.4, 1);
    expect(blend(zq(0), 0.25, zq(90), 0.75)).toBeCloseTo(expected, 2);
});
