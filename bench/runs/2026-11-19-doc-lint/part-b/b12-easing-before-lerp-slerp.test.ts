// b-12. Lines 314-315: "The evaluator applies this transform after STEP handling and before scalar/vector lerp or quaternion slerp."
// Easing g*g at half way: a vector lerps at 0.25; a quaternion from identity to 90 degrees about z
// slerps at 0.25 (22.5 degrees); a STEP track returns its held key before any easing.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("eased progress feeds vector lerp and quaternion slerp; STEP returns before easing", () => {
    let calls = 0;
    const easing = (g: number) => {
        calls++;
        return g * g;
    };
    const s = Math.SQRT1_2;
    const target = { p: { x: 0, y: 0, z: 0 }, rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 }, st: -1 };
    const clip = createPropertyAnimationClip(
        "c",
        [
            { path: "p", easing, keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [10, 20, 30] }] },
            { path: "rotationQuaternion", easing, keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 0, s, s] }] },
            { path: "st", interpolation: "step", easing, keys: [{ time: 0, value: 4 }, { time: 1, value: 8 }] },
        ],
        { frameRate: 2 }
    );
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    calls = 0;
    goToFrame(group, 1); // 0.5 s
    expect(calls).toBe(2);
    expect(target.p).toEqual({ x: 2.5, y: 5, z: 7.5 });
    const half = (Math.PI / 4) * 0.25 / 1; // quaternion angle 45 deg * 0.25
    expect(target.rotationQuaternion.z).toBeCloseTo(Math.sin(half), 6);
    expect(target.rotationQuaternion.w).toBeCloseTo(Math.cos(half), 6);
    expect(target.st).toBe(4);
});
