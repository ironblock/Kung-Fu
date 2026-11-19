// c-35. Line 588: "The mixer evaluates override/base groups first, then applies additive deltas in manager order before
// the single skeleton upload."
// Checked: the additive group is added to the manager BEFORE the base group. Base holds x = 10 (weight 1); the additive
// clip moves x from 0 to 10, reference frame 0, so at 0.5 s its delta is +5. Uploaded: 15 (base first, delta on top),
// with one bone-texture write. Two additive rotation layers about different axes are then applied in manager order:
// swapping their manager order changes the result, and each result equals base * d1 * d2 in that order.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationAdditive, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("base first, then the additive delta, one upload", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [additive, base] = createAnimationGroups(gltf([moveClip("add", 0, 10), moveClip("base", 10, 10)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    setAnimationAdditive(additive!, { referenceFrame: 0 });
    addAnimationGroup(manager, additive!);
    addAnimationGroup(manager, base!);
    playAnimation(base!);
    updateAnimationManager(manager, 500);
    expect(rootPose(skel.boneMatrices).tx).toBeCloseTo(15, 4);
    expect(rec.calls.filter((c) => c.method === "writeTexture").length).toBe(1);
});

// Quaternion helpers for the order check.
const axisQ = (axis: number[], deg: number) => {
    const h = (deg * Math.PI) / 360;
    return [axis[0]! * Math.sin(h), axis[1]! * Math.sin(h), axis[2]! * Math.sin(h), Math.cos(h)];
};
const mul = (a: number[], b: number[]) => [
    a[3]! * b[0]! + a[0]! * b[3]! + a[1]! * b[2]! - a[2]! * b[1]!,
    a[3]! * b[1]! - a[0]! * b[2]! + a[1]! * b[3]! + a[2]! * b[0]!,
    a[3]! * b[2]! + a[0]! * b[1]! - a[1]! * b[0]! + a[2]! * b[3]!,
    a[3]! * b[3]! - a[0]! * b[0]! - a[1]! * b[1]! - a[2]! * b[2]!,
];
// Column-major rotation matrix of a quaternion, mirrored on x as the default root transform does.
function uploaded(q: number[]): number[] {
    const [x, y, z, w] = q as [number, number, number, number];
    const m = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)];
    return [-m[0]!, m[1]!, m[2]!, -m[3]!, m[4]!, m[5]!, -m[6]!, m[7]!, m[8]!];
}
const turn = (name: string, axis: number[]): ClipSpec => ({
    name,
    duration: 1,
    channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }],
    samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([...axisQ(axis, 0), ...axisQ(axis, 90)]), interpolation: 0 }],
});

test("additive layers apply in manager order", () => {
    const at = (xFirst: boolean) => {
        const rec = recordingEngine();
        const skel = skeleton(0);
        const [ax, az] = createAnimationGroups(gltf([turn("x", [1, 0, 0]), turn("z", [0, 0, 1])], [rest()], { skeletons: [skel] }));
        const manager = createAnimationManager({ engine: rec.engine });
        enableAnimationBlending(manager);
        setAnimationAdditive(ax!, { referenceFrame: 0 });
        setAnimationAdditive(az!, { referenceFrame: 0 });
        playAnimation(az!);
        for (const g of xFirst ? [ax!, az!] : [az!, ax!]) {
            addAnimationGroup(manager, g);
        }
        updateAnimationManager(manager, 500);
        const m = skel.boneMatrices;
        return [m[0]!, m[1]!, m[2]!, m[4]!, m[5]!, m[6]!, m[8]!, m[9]!, m[10]!];
    };
    const dx = axisQ([1, 0, 0], 45);
    const dz = axisQ([0, 0, 1], 45);
    const xThenZ = at(true);
    const zThenX = at(false);
    const close = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]!) < 1e-4);
    expect(close(xThenZ, zThenX)).toBe(false);
    expect(close(xThenZ, uploaded(mul(mul([0, 0, 0, 1], dx), dz)))).toBe(true);
    expect(close(zThenX, uploaded(mul(mul([0, 0, 0, 1], dz), dx)))).toBe(true);
});
