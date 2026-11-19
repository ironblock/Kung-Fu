// c-81. Lines 661-662: requirement "cycle loop mode, a forward non-empty play range, and a finite non-negative speed
// ratio."
// Compat package. Checked: CYCLE, range 0..10, speed 1 and speed 0 are delegated; RELATIVE and CONSTANT loop modes, an
// empty range (5..5), a reverse range (10..0), and a NaN speed are not.
import { anim, AnimationLoopModes, makeScene, ramp } from "./_compat";

const keys = [{ frame: 0, value: 0 }, { frame: 10, value: 10 }];

test("cycle, forward range, finite non-negative speed", () => {
    const scene = makeScene();
    const lite = (a = ramp(), from = 0, to = 10, speed = 1) => scene.beginDirectAnimation({ v: 0 }, [a], from, to, true, speed)._lite;
    expect(lite()).toBeDefined();
    expect(lite(ramp(), 0, 10, 0)).toBeDefined();
    expect(lite(anim("v", keys, 10, 0, AnimationLoopModes.ANIMATIONLOOPMODE_RELATIVE))).toBeUndefined();
    expect(lite(anim("v", keys, 10, 0, AnimationLoopModes.ANIMATIONLOOPMODE_CONSTANT))).toBeUndefined();
    expect(lite(ramp(), 5, 5)).toBeUndefined();
    expect(lite(ramp(), 10, 0)).toBeUndefined();
    expect(lite(ramp(), 0, 10, NaN)).toBeUndefined();
});
