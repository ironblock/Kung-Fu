// c-87. Lines 675-676: "A seek evaluates once without rejoining the per-frame manager."
// Compat package. Checked: a paused delegated animatable seeks to frame 3: the value is written at once, the Lite group
// is not put back on the manager, and the next frame changes nothing.
import { attached, frame, makeScene, ramp } from "./_compat";

test("seek while paused", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const a = scene.beginDirectAnimation(target, [ramp()], 0, 10, true);
    a.pause();
    a.goToFrame(3);
    expect(target.v).toBeCloseTo(3, 5);
    expect(attached(scene)).toEqual([]);
    target.v = -7;
    frame(scene, 500);
    expect(target.v).toBe(-7);
    expect(a._lite!.currentTime).toBeCloseTo(0.3, 6);
});
