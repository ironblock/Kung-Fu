// b-15. Lines 317-319: "The returned progress is not clamped: overshooting curves may extrapolate scalar/vector values or continue a quaternion slerp beyond the segment endpoint."
// Easing returns 1.5 (or -0.5). Scalar 0 -> 10 gives 15 (or -5); vector likewise; a quaternion slerp
// from identity to 90 degrees about z, at 1.5, gives 135 degrees about z.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

function run(out: number) {
    const s = Math.SQRT1_2;
    const target = { v: 0, p: { x: 0, y: 0 }, rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } };
    const easing = () => out;
    const clip = createPropertyAnimationClip(
        "c",
        [
            { path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
            { path: "p", easing, keys: [{ time: 0, value: [0, 0] }, { time: 1, value: [10, 20] }] },
            { path: "rotationQuaternion", easing, keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 0, s, s] }] },
        ],
        { frameRate: 2 }
    );
    goToFrame(createPropertyAnimationGroup(createAnimationManager(), target, clip), 1);
    return target;
}

test("progress outside [0, 1] extrapolates values and continues the slerp", () => {
    const over = run(1.5);
    expect(over.v).toBe(15);
    expect(over.p).toEqual({ x: 15, y: 30 });
    const angle = (Math.PI / 4) * 1.5;
    expect(over.rotationQuaternion.z).toBeCloseTo(Math.sin(angle), 6);
    expect(over.rotationQuaternion.w).toBeCloseTo(Math.cos(angle), 6);
    const under = run(-0.5);
    expect(under.v).toBe(-5);
    expect(under.p).toEqual({ x: -5, y: -10 });
});
