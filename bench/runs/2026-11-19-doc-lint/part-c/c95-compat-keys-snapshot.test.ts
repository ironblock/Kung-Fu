// c-95. Lines 696-697: "The compiled clip is still a snapshot of key frames at `beginDirectAnimation()` time."
// Compat package. Checked: setKeys with new keys after the call does not change what the delegated group writes.
import { frame, makeScene, ramp } from "./_compat";

test("later setKeys is not seen", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const a = ramp();
    scene.beginDirectAnimation(target, [a], 0, 10, true);
    a.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
    ]);
    frame(scene, 500);
    expect(target.v).toBeCloseTo(5, 5);
});
