// c-98. Lines 706-708: "Calls with differing track frame rates, reverse ranges/speeds, non-finite timing, or no
// animations retain the existing whole-call fallback because they do not share one native facade clock."
// Compat package. Checked: in each case a track that would be delegated on its own is not delegated (no Lite group at
// all), and a call with no animations returns an Animatable without error.
import { makeScene, ramp } from "./_compat";

test("whole-call fallback cases", () => {
    const scene = makeScene();
    const t = () => ({ a: 0, b: 0, v: 0 });
    expect(scene.beginDirectAnimation(t(), [ramp("a", 10, 10), ramp("b", 10, 20)], 0, 10, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation(t(), [ramp("v")], 10, 0, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation(t(), [ramp("v")], 0, 10, true, -1)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation(t(), [ramp("v")], 0, Infinity, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation(t(), [ramp("v")], 0, 10, true, Infinity)._lite).toBeUndefined();
    const empty = scene.beginDirectAnimation(t(), [], 0, 10, true);
    expect(empty._lite).toBeUndefined();
});
