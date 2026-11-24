// c-80. Line 660: requirement "one interpolation mode for the whole track (all LINEAR or all STEP);"
// Compat package. Checked: all-LINEAR and all-STEP tracks are delegated (the STEP one holds its key value on Lite); a
// track mixing STEP and LINEAR segments is not.
import { anim, AnimationKeyInterpolation, frame, makeScene } from "./_compat";

const S = AnimationKeyInterpolation.STEP;

test("one interpolation mode per track", () => {
    const scene = makeScene();
    const linear = scene.beginDirectAnimation({ v: 0 }, [anim("v", [{ frame: 0, value: 0 }, { frame: 5, value: 5 }, { frame: 10, value: 10 }])], 0, 10, true);
    expect(linear._lite).toBeDefined();
    const stepTarget = { v: 0 };
    const step = scene.beginDirectAnimation(stepTarget, [anim("v", [{ frame: 0, value: 0, interpolation: S }, { frame: 5, value: 5, interpolation: S }, { frame: 10, value: 10, interpolation: S }])], 0, 10, true);
    expect(step._lite).toBeDefined();
    frame(scene, 400);
    expect(stepTarget.v).toBe(0);
    const mixed = scene.beginDirectAnimation({ v: 0 }, [anim("v", [{ frame: 0, value: 0, interpolation: S }, { frame: 5, value: 5 }, { frame: 10, value: 10 }])], 0, 10, true);
    expect(mixed._lite).toBeUndefined();
});
