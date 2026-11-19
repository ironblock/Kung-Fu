// c-100. Lines 710-711: "Assigning a negative or non-finite speed after native playback starts is rejected explicitly
// rather than silently changing evaluator ownership."
// Compat package. Checked: on a delegated Animatable, speedRatio = -1, NaN and Infinity each throw and leave the speed
// and the Lite group as they were; speedRatio = 2 is accepted.
import { makeScene, ramp } from "./_compat";

test("bad speeds throw", () => {
    const scene = makeScene();
    const a = scene.beginDirectAnimation({ v: 0 }, [ramp()], 0, 10, true);
    const lite = a._lite!;
    for (const bad of [-1, NaN, Infinity]) {
        expect(() => {
            a.speedRatio = bad;
        }).toThrow();
    }
    expect(a.speedRatio).toBe(1);
    expect(a._lite).toBe(lite);
    a.speedRatio = 2;
    expect(lite.speedRatio).toBe(2);
});
