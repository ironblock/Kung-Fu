// c-123. Line 753: "**Property easing**: Verify scalar/vector/quaternion interpolation uses eased segment progress, STEP
// bypasses the callback, endpoints remain exact, and overshooting values are not clamped"
// Checked: (1) scalar, vector and quaternion tracks eased by g*g at the middle of a segment give the value at progress
// 0.25 (quaternion: the slerp at 0.25); (2) a STEP track never calls its easing; (3) at the first and last key times the
// key values come out exactly even with an easing that maps 0 to 0.3 and 1 to 0.7 (fair reading: "endpoints" are the
// clip's first and last keys); (4) an easing that returns 1.5 gives 15 on a 0-to-10 segment.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";
import { zq } from "./_fx";

const sq = (g: number) => g * g;

test("eased progress on scalar, vector, quaternion", () => {
    const q = { x: 0, y: 0, z: 0, w: 1 };
    const target = { s: 0, v: { x: 0, y: 0, z: 0 }, rotationQuaternion: q };
    const clip = createPropertyAnimationClip("c", [
        { path: "s", easing: sq, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "v", easing: sq, keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [10, 20, 40] }] },
        { path: "rotationQuaternion", easing: sq, keys: [{ time: 0, value: zq(0) }, { time: 1, value: zq(120) }] },
    ]);
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(g, 30);
    expect(target.s).toBeCloseTo(2.5, 5);
    expect(target.v).toMatchObject({ x: expect.closeTo(2.5, 5), y: expect.closeTo(5, 5), z: expect.closeTo(10, 5) });
    const e = zq(30);
    expect([q.x, q.y, q.z, q.w].every((c, i) => Math.abs(c - e[i]!) < 1e-5)).toBe(true);
});

test("STEP never calls easing", () => {
    let calls = 0;
    const target = { s: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "s", interpolation: "step", easing: (g) => (calls++, g), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] }]);
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    for (const f of [0, 30, 60, 90, 120]) {
        goToFrame(g, f);
    }
    expect(calls).toBe(0);
    expect(target.s).toBe(20);
});

test("endpoints exact, overshoot kept", () => {
    const target = { s: 0, o: 0 };
    const clip = createPropertyAnimationClip("c", [
        { path: "s", easing: (g) => 0.3 + 0.4 * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "o", easing: () => 1.5, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
    ]);
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(g, 0);
    expect(target.s).toBe(0);
    goToFrame(g, 60);
    expect(target.s).toBe(10);
    goToFrame(g, 30);
    expect(target.o).toBe(15);
});
