// c-99. Lines 708-709: "Compat normalizes reverse ranges/speeds using Babylon.js rules and advances each fallback
// animation with its own frame rate."
// Compat package. Checked: (1) range 10..0 at speed 1 plays from 10 toward 0 (5 after 0.5 s at 10 fps); (2) range 0..10
// at speed -1 also plays from 10 toward 0; (3) two animations at 10 and 20 fps in one call (whole-call fallback) are at
// frame 5 and frame 10 after 0.5 s. The Babylon.js rules themselves are not run; the rule assumed is that a negative
// speed swaps the range and a reverse range plays backward.
import { anim, frame, makeScene, ramp } from "./_compat";

test("reverse range and reverse speed play backward", () => {
    const scene = makeScene();
    const a = { v: -1 };
    scene.beginDirectAnimation(a, [ramp()], 10, 0, false);
    const b = { v: -1 };
    scene.beginDirectAnimation(b, [ramp()], 0, 10, false, -1);
    expect(a.v).toBe(10);
    expect(b.v).toBe(10);
    frame(scene, 500);
    expect(a.v).toBeCloseTo(5, 5);
    expect(b.v).toBeCloseTo(5, 5);
});

test("each fallback animation at its own rate", () => {
    const scene = makeScene();
    const t = { a: -1, b: -1 };
    const fast = anim("b", [{ frame: 0, value: 0 }, { frame: 20, value: 20 }], 20);
    scene.beginDirectAnimation(t, [ramp("a", 10, 10), fast], 0, 20, true);
    frame(scene, 500);
    expect(t.a).toBeCloseTo(5, 5);
    expect(t.b).toBeCloseTo(10, 5);
});
