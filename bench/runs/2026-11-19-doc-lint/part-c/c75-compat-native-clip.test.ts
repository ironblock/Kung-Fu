// c-75. Lines 650-651: "`@babylonjs/lite-compat` translates each Babylon.js-shaped `Animation` whose semantics the
// native property system can preserve into a native property clip."
// Compat package. Checked: scene.beginDirectAnimation with one plain float Animation gives an Animatable backed by a
// Lite property group (internal field _lite) that the scene's Lite manager drives; after 0.5 s the Lite group's time is
// 0.5 and the target holds the value Lite wrote.
import { attached, frame, makeScene, ramp } from "./_compat";

test("a supported Animation runs as a Lite property group", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const animatable = scene.beginDirectAnimation(target, [ramp()], 0, 10, true);
    expect(animatable._lite).toBeDefined();
    expect(attached(scene)).toContain(animatable._lite);
    frame(scene, 500);
    expect(animatable._lite!.currentTime).toBeCloseTo(0.5, 6);
    expect(target.v).toBeCloseTo(5, 5);
});
