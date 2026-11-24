// b-38. Lines 390-391: "Preserve callback receivers, unclamped overshoot and current scalar/vector/quaternion interpolation."
// Compat package. Checked: ease() is called with `this` set to the easing object; a result of 1.5
// is not clamped; vectors (arrays) lerp per component and quaternions slerp, at the eased progress.
import { Animation } from "#compat/animations/animation.ts";

test("receiver kept, overshoot kept, vector and quaternion interpolation kept", () => {
    const easing = {
        factor: 1.5,
        ease(this: { factor: number }, g: number) {
            return g * 2 * this.factor;
        },
    };
    const scalar = new Animation("a", "v", 10);
    scalar.setKeys([
        { frame: 0, value: 0, easingFunction: easing },
        { frame: 10, value: 10 },
    ]);
    expect(scalar.evaluate(5)).toBe(15);
    const vector = new Animation("b", "p", 10, Animation.ANIMATIONTYPE_VECTOR3);
    vector.setKeys([
        { frame: 0, value: [0, 0, 0], easingFunction: easing },
        { frame: 10, value: [10, 20, 30] },
    ]);
    expect(vector.evaluate(5)).toEqual([15, 30, 45]);
    const s = Math.SQRT1_2;
    const quat = new Animation("c", "q", 10, Animation.ANIMATIONTYPE_QUATERNION);
    quat.setKeys([
        { frame: 0, value: [0, 0, 0, 1], easingFunction: { ease: () => 0.5 } },
        { frame: 10, value: [0, 0, s, s] },
    ]);
    const q = quat.evaluate(2) as number[];
    expect(q[2]).toBeCloseTo(Math.sin(Math.PI / 8), 6);
    expect(q[3]).toBeCloseTo(Math.cos(Math.PI / 8), 6);
});
