// c-96. Lines 697-700: "This matches Babylon.js for later `setKeys()` replacement (existing runtime animations retain
// their key array), but unlike Babylon.js it does not observe in-place mutation of key objects already compiled into
// packed native buffers."
// Compat package. Checked, the Lite side: changing a key object's value in place after the call does not change what
// the delegated group writes. (Babylon.js itself is not run.)
import { frame, makeScene, ramp } from "./_compat";

test("in-place key edits are not seen", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const a = ramp();
    scene.beginDirectAnimation(target, [a], 0, 10, true);
    a.getKeys()[1]!.value = 100;
    frame(scene, 500);
    expect(target.v).toBeCloseTo(5, 5);
});
