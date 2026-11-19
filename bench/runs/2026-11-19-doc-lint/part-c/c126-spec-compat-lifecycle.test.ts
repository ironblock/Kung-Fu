// c-126. Line 756: "**Compat lifecycle**: Verify nonzero ranges, exact loop boundaries, completion,
// pause/restart/stop, full-key-domain seeking, positive speed changes, and overlapping write order"
// Compat package, delegated tracks. Checked: a range 2..8 starts at 2 and loops back to 2 exactly at its end; a
// non-looping call completes once with the final value; pause holds, restart continues, stop ends; a seek outside the
// play range but inside the keys lands there; a speed change to 2 doubles the advance; of two calls writing one
// property, the later one's write lands last.
import { anim, frame, makeScene, ramp } from "./_compat";

test("compat lifecycle on Lite", () => {
    const scene = makeScene();
    const t = { v: -1 };
    const a = scene.beginDirectAnimation(t, [ramp()], 2, 8, true);
    expect(t.v).toBeCloseTo(2, 5);
    frame(scene, 600);
    expect(t.v).toBeCloseTo(2, 5);
    frame(scene, 100);
    expect(t.v).toBeCloseTo(3, 5);
    a.pause();
    frame(scene, 300);
    expect(t.v).toBeCloseTo(3, 5);
    a.restart();
    frame(scene, 100);
    expect(t.v).toBeCloseTo(4, 5);
    a.goToFrame(9);
    expect(t.v).toBeCloseTo(9, 5);
    a.goToFrame(4);
    a.speedRatio = 2;
    frame(scene, 100);
    expect(t.v).toBeCloseTo(6, 5);
    a.stop();
    frame(scene, 100);
    expect(t.v).toBeCloseTo(6, 5);

    let ended = 0;
    const once = { v: -1 };
    scene.beginDirectAnimation(once, [ramp()], 0, 10, false, 1, () => void ended++);
    frame(scene, 2000);
    frame(scene, 100);
    expect(ended).toBe(1);
    expect(once.v).toBe(10);

    const shared = { v: 0 };
    const hold = (v: number) => anim("v", [{ frame: 0, value: v }, { frame: 10, value: v }]);
    scene.beginDirectAnimation(shared, [hold(1)], 0, 10, true);
    scene.beginDirectAnimation(shared, [hold(2)], 0, 10, true);
    frame(scene, 100);
    expect(shared.v).toBe(2);
});
